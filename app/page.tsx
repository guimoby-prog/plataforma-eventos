import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type ItemSimples = { nome?: string; logoUrl?: string; siteUrl?: string; numero?: string; descricao?: string; cargo?: string; texto?: string; fotoUrl?: string; pergunta?: string; resposta?: string };
type ConteudoVideo = { url: string; legenda?: string };
type ConteudoBanner = { imageUrl: string; link?: string };
type ConteudoTexto = { texto: string };
type ConteudoLista = { items: ItemSimples[] };
type ConteudoAny = ConteudoVideo | ConteudoBanner | ConteudoTexto | ConteudoLista;

// ─── Builder renderer ──────────────────────────────────────────────────────────
type Bloco = { id: string; tipo: string; texto?: string; fontSize?: string; fontWeight?: string; cor?: string; align?: string; src?: string; alt?: string; largura?: string; arredondado?: string; sombra?: boolean; label?: string; href?: string; corFundo?: string; corTexto?: string; tamanho?: string; larguraTotal?: boolean; url?: string; corLinha?: string; espessura?: string; altura?: string };
type ColunaBuilder = { id: string; blocos: Bloco[] };
type ConteudoBuilder = { layout: string; colunas: ColunaBuilder[]; bgColor: string; textColor: string; padding: string };

const LAYOUT_WIDTHS: Record<string, string[]> = {
  "1": ["flex-1"],
  "2-eq": ["flex-1", "flex-1"],
  "2-wide-left": ["flex-[2]", "flex-1"],
  "2-wide-right": ["flex-1", "flex-[2]"],
  "3": ["flex-1", "flex-1", "flex-1"],
};

function BlocoRender({ bloco }: { bloco: Bloco }) {
  const alignClass = bloco.align === "center" ? "text-center" : bloco.align === "right" ? "text-right" : "text-left";
  if (bloco.tipo === "heading") {
    return <p className={`font-${bloco.fontWeight ?? "bold"} text-${bloco.fontSize ?? "2xl"} ${alignClass} leading-tight`} style={{ color: bloco.cor ?? "inherit" }}>{bloco.texto}</p>;
  }
  if (bloco.tipo === "texto") {
    return <p className={`text-${bloco.fontSize ?? "base"} font-${bloco.fontWeight ?? "normal"} ${alignClass} leading-relaxed whitespace-pre-line`} style={{ color: bloco.cor ?? "inherit" }}>{bloco.texto}</p>;
  }
  if (bloco.tipo === "imagem" && bloco.src) {
    const w = bloco.largura === "3/4" ? "75%" : bloco.largura === "1/2" ? "50%" : bloco.largura === "1/3" ? "33%" : "100%";
    return <div style={{ width: w, margin: "0 auto" }}><img src={bloco.src} alt={bloco.alt ?? ""} className={`w-full object-cover rounded-${bloco.arredondado ?? "lg"} ${bloco.sombra ? "shadow-lg" : ""}`} /></div>;
  }
  if (bloco.tipo === "botao" && bloco.label) {
    const sz = bloco.tamanho === "sm" ? "px-4 py-2 text-sm" : bloco.tamanho === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3";
    return <div className={alignClass}><a href={bloco.href ?? "#"} className={`inline-block font-semibold rounded-xl ${sz} ${bloco.larguraTotal ? "w-full text-center block" : ""}`} style={{ background: bloco.corFundo ?? "#00A859", color: bloco.corTexto ?? "#fff" }}>{bloco.label}</a></div>;
  }
  if (bloco.tipo === "video" && bloco.url) {
    const emb = bloco.url.includes("youtu.be/") ? bloco.url.replace("youtu.be/", "www.youtube.com/embed/") : bloco.url.replace("watch?v=", "embed/");
    return <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}><iframe src={emb} className="absolute inset-0 w-full h-full" allowFullScreen /></div>;
  }
  if (bloco.tipo === "divisor") {
    return <hr style={{ borderColor: bloco.corLinha ?? "#e5e7eb", borderTopWidth: `${bloco.espessura ?? 1}px` }} />;
  }
  if (bloco.tipo === "espaco") {
    return <div style={{ height: `${bloco.altura ?? 8}px` }} />;
  }
  return null;
}

function SecaoBuilder({ c, s }: { c: ConteudoBuilder; s: { bgColor: string; textColor: string; padding: string } }) {
  const widths = LAYOUT_WIDTHS[c.layout] ?? ["flex-1"];
  return (
    <div className={`${c.padding ?? s.padding} px-6 max-w-7xl mx-auto`}>
      <div className="flex gap-8 flex-wrap md:flex-nowrap">
        {c.colunas.map((col, i) => (
          <div key={col.id} className={`${widths[i] ?? "flex-1"} min-w-0 space-y-4`}>
            {col.blocos.map((bloco) => <BlocoRender key={bloco.id} bloco={bloco} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoVideo({ c, titulo }: { c: ConteudoVideo; titulo: string | null }) {
  if (!c.url) return null;
  const embedUrl = c.url.includes("youtube.com/watch")
    ? c.url.replace("watch?v=", "embed/")
    : c.url.includes("youtu.be/")
    ? c.url.replace("youtu.be/", "www.youtube.com/embed/")
    : c.url;
  return (
    <div className="max-w-4xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-8">{titulo}</h2>}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
        <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen title={titulo ?? "vídeo"} />
      </div>
      {c.legenda && <p className="text-center mt-4 text-sm opacity-70">{c.legenda}</p>}
    </div>
  );
}

function SecaoPatrocinadores({ c, titulo }: { c: ConteudoLista; titulo: string | null }) {
  return (
    <div className="max-w-5xl mx-auto px-4" id="patrocinadores">
      {titulo && <h2 className="text-3xl font-bold text-center mb-12">{titulo}</h2>}
      <div className="flex flex-wrap justify-center gap-10 items-center">
        {c.items?.map((item, i) => (
          <a key={i} href={item.siteUrl || "#"} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={item.nome} className="h-16 object-contain" />
            ) : (
              <span className="text-lg font-bold">{item.nome}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function SecaoNumeros({ c, titulo, primary }: { c: ConteudoLista; titulo: string | null; primary: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-12">{titulo}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {c.items?.map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-5xl font-bold mb-2" style={{ color: primary }}>{item.numero}</p>
            <p className="text-sm opacity-70 font-medium uppercase tracking-widest">{item.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoDepoimentos({ c, titulo, primary }: { c: ConteudoLista; titulo: string | null; primary: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-12">{titulo}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {c.items?.map((item, i) => (
          <div key={i} className="rounded-2xl border p-6 shadow-sm">
            <p className="text-sm leading-relaxed mb-5 opacity-80">"{item.texto}"</p>
            <div className="flex items-center gap-3">
              {item.fotoUrl ? (
                <img src={item.fotoUrl} alt={item.nome} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: primary }}>
                  {item.nome?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{item.nome}</p>
                {item.cargo && <p className="text-xs opacity-60">{item.cargo}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoFaq({ c, titulo }: { c: ConteudoLista; titulo: string | null }) {
  return (
    <div className="max-w-3xl mx-auto px-4" id="duvidas">
      {titulo && <h2 className="text-3xl font-bold text-center mb-12">{titulo}</h2>}
      <div className="space-y-3">
        {c.items?.map((item, i) => (
          <details key={i} className="rounded-2xl border p-5 group cursor-pointer">
            <summary className="font-semibold text-sm list-none flex justify-between items-center gap-4">
              <span>{item.pergunta}</span>
              <span className="text-lg opacity-40 shrink-0 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed opacity-70 pt-3 border-t">{item.resposta}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function SecaoTexto({ c, titulo }: { c: ConteudoTexto; titulo: string | null }) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-8">{titulo}</h2>}
      <p className="leading-relaxed whitespace-pre-line text-lg">{c.texto}</p>
    </div>
  );
}

function SecaoBanner({ c, titulo }: { c: ConteudoBanner; titulo: string | null }) {
  if (!c.imageUrl) return null;
  const img = <img src={c.imageUrl} alt={titulo ?? "banner"} className="w-full rounded-2xl shadow-lg object-cover max-h-[500px]" />;
  return (
    <div className="max-w-5xl mx-auto px-4">
      {c.link ? <a href={c.link} target="_blank" rel="noopener noreferrer">{img}</a> : img}
    </div>
  );
}

export default async function Home() {
  const evento = await prisma.event.findFirst({ where: { isPublished: true } });

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Nenhum evento publicado no momento.
      </div>
    );
  }

  const [sessoes, palestrantes, secoes] = await Promise.all([
    prisma.session.findMany({
      where: { eventId: evento.id },
      include: { speakers: true },
      orderBy: [{ startTime: "asc" }],
    }),
    prisma.speaker.findMany({
      where: { eventId: evento.id },
      orderBy: { name: "asc" },
    }),
    prisma.secao.findMany({
      where: { eventId: evento.id, visivel: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  const diasMap = new Map<string, typeof sessoes>();
  for (const s of sessoes) {
    const dia = s.startTime
      ? new Date(s.startTime).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
      : "Sem data";
    if (!diasMap.has(dia)) diasMap.set(dia, []);
    diasMap.get(dia)!.push(s);
  }
  const dias = Array.from(diasMap.entries());

  const dataFormatada = evento.startDate && evento.endDate
    ? `${new Date(evento.startDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} a ${new Date(evento.endDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`
    : evento.startDate
    ? new Date(evento.startDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const primary = evento.primaryColor;
  const secondary = evento.secondaryColor;
  const font = evento.fontFamily;
  const heroTitle = evento.heroTitle || evento.name;
  const heroSubtitle = evento.heroSubtitle || evento.description;
  const footerText = evento.footerText || `© ${new Date().getFullYear()} ${evento.name}. Todos os direitos reservados.`;

  function renderSecao(s: (typeof secoes)[0]) {
    if (s.tipo === "builder") {
      let cb: ConteudoBuilder;
      try { cb = JSON.parse(s.conteudo || "{}") as ConteudoBuilder; } catch { return null; }
      return (
        <section key={s.id} style={{ background: cb.bgColor ?? s.bgColor, color: s.textColor }}>
          <SecaoBuilder c={cb} s={s} />
        </section>
      );
    }
    const c = JSON.parse(s.conteudo || "{}") as ConteudoAny;
    const alignClass = s.align === "left" ? "text-left" : s.align === "right" ? "text-right" : "text-center";
    return (
      <section key={s.id} className={`${s.padding} ${alignClass}`} style={{ background: s.bgColor, color: s.textColor }}>
        {s.tipo === "video" && <SecaoVideo c={c as ConteudoVideo} titulo={s.titulo} />}
        {s.tipo === "patrocinadores" && <SecaoPatrocinadores c={c as ConteudoLista} titulo={s.titulo} />}
        {s.tipo === "numeros" && <SecaoNumeros c={c as ConteudoLista} titulo={s.titulo} primary={primary} />}
        {s.tipo === "depoimentos" && <SecaoDepoimentos c={c as ConteudoLista} titulo={s.titulo} primary={primary} />}
        {s.tipo === "faq" && <SecaoFaq c={c as ConteudoLista} titulo={s.titulo} />}
        {s.tipo === "texto" && <SecaoTexto c={c as ConteudoTexto} titulo={s.titulo} />}
        {s.tipo === "banner" && <SecaoBanner c={c as ConteudoBanner} titulo={s.titulo} />}
      </section>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: font }}>
      <Navbar eventName={evento.name} primaryColor={primary} secondaryColor={secondary} logoUrl={evento.logoUrl} />

      {/* Hero fullscreen */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: secondary }}>
        {/* Fundo com banner */}
        {evento.bannerUrl && (
          <img src={evento.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Overlay gradiente */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(105deg, ${secondary}f0 45%, ${secondary}90 65%, transparent 100%)` }} />
        {/* Detalhes decorativos */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 -translate-y-1/3 translate-x-1/3" style={{ background: primary }} />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full opacity-5 translate-y-1/2" style={{ background: primary }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Conteúdo esquerdo */}
            <div className="text-white">
              {dataFormatada && (
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white/80" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <span style={{ color: primary }}>●</span> {dataFormatada}
                </div>
              )}
              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
                {heroTitle}
              </h1>
              {evento.location && (
                <p className="flex items-center gap-2 text-white/70 mb-4 text-lg">
                  <span>📍</span> {evento.location}
                </p>
              )}
              {heroSubtitle && (
                <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">{heroSubtitle}</p>
              )}
              <div className="flex flex-wrap gap-4">
                <Link href="/inscricao"
                  className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-white"
                  style={{ background: primary }}>
                  Garantir minha vaga →
                </Link>
                <Link href="#programacao"
                  className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl text-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                  Ver programação
                </Link>
              </div>
            </div>

            {/* Card de inscrição direito */}
            <div className="lg:flex justify-end hidden">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <h3 className="text-white font-bold text-2xl mb-2">Inscrições abertas!</h3>
                <p className="text-white/70 text-sm mb-6">Garanta sua participação neste evento exclusivo.</p>
                <div className="space-y-3 mb-6">
                  {["Acesso completo à programação", "Networking com especialistas", "Certificado de participação"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-white/80 text-sm">
                      <span style={{ color: primary }}>✓</span> {item}
                    </div>
                  ))}
                </div>
                <Link href="/inscricao"
                  className="block w-full text-center font-bold py-4 rounded-xl text-white text-lg hover:opacity-90 transition-opacity shadow-lg"
                  style={{ background: primary }}>
                  Quero me inscrever →
                </Link>
                <Link href="/participante/area" className="block text-center text-white/60 hover:text-white text-sm mt-3 transition-colors">
                  Já tenho inscrição — Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce text-2xl">↓</div>
      </section>

      {/* Programação */}
      {sessoes.length > 0 && (
        <section id="programacao" className="py-24 px-4" style={{ background: "#f9fafb" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 inline-block" style={{ background: `${primary}15`, color: primary }}>Agenda</span>
              <h2 className="text-4xl font-black text-gray-900 mt-3">Programação</h2>
            </div>
            {dias.map(([dia, items], i) => (
              <div key={dia} className="mb-12">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: primary }}>
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 capitalize">{dia}</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-3 ml-14">
                  {items.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                      <div className="shrink-0 text-center min-w-[56px]">
                        <span className="font-black text-sm block" style={{ color: primary }}>
                          {s.startTime ? new Date(s.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </span>
                        {s.endTime && (
                          <span className="text-xs text-gray-400">
                            {new Date(s.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{s.title}</p>
                        {s.description && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{s.description}</p>}
                        <p className="text-sm text-gray-400 mt-1">
                          {s.speakers.map((sp) => sp.name).join(", ")}
                          {s.speakers.length > 0 && s.location ? " · " : ""}
                          {s.location ?? ""}
                        </p>
                      </div>
                      {s.track && (
                        <span className="text-xs px-3 py-1 rounded-full font-semibold shrink-0" style={{ color: primary, background: `${primary}15` }}>{s.track}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Palestrantes */}
      {palestrantes.length > 0 && (
        <section id="palestrantes" className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 inline-block" style={{ background: `${primary}15`, color: primary }}>Speakers</span>
              <h2 className="text-4xl font-black text-gray-900 mt-3">Palestrantes</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {palestrantes.map((p) => (
                <div key={p.id} className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-md group-hover:shadow-lg transition-shadow" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black text-white shadow-md" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  {p.role && <p className="text-xs font-bold mt-1 mb-2 uppercase tracking-wider" style={{ color: primary }}>{p.role}</p>}
                  {p.bio && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{p.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seções dinâmicas */}
      {secoes.map(renderSecao)}

      {/* CTA final */}
      <section className="py-24 px-4 text-white text-center relative overflow-hidden" style={{ background: secondary }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full -translate-y-1/2" style={{ background: primary }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full translate-y-1/2" style={{ background: primary }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">Não perca esta oportunidade</h2>
          <p className="mb-10 text-lg opacity-70 leading-relaxed">Vagas limitadas. Inscreva-se agora e garanta sua participação neste evento exclusivo.</p>
          <Link href="/inscricao"
            className="inline-block font-black px-10 py-5 rounded-2xl text-xl shadow-2xl hover:scale-105 transition-transform"
            style={{ background: primary, color: "white" }}>
            Fazer inscrição →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {evento.logoUrl ? (
              <img src={evento.logoUrl} alt="logo" className="h-8 object-contain opacity-60" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: primary }}>
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z" fill="white" /></svg>
              </div>
            )}
            <p className="text-gray-500 text-sm">{footerText}</p>
          </div>
          <div className="flex gap-6 text-gray-600 text-sm">
            <Link href="/participante/area" className="hover:text-gray-300 transition-colors">Área do participante</Link>
            <Link href="/inscricao" className="hover:text-gray-300 transition-colors">Inscrições</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
