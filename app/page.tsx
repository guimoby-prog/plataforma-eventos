import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type ItemSimples = { nome?: string; logoUrl?: string; siteUrl?: string; numero?: string; descricao?: string; nome2?: string; cargo?: string; texto?: string; fotoUrl?: string; pergunta?: string; resposta?: string };
type ConteudoVideo = { url: string; legenda?: string };
type ConteudoBanner = { imageUrl: string; link?: string };
type ConteudoTexto = { texto: string };
type ConteudoLista = { items: ItemSimples[] };
type ConteudoAny = ConteudoVideo | ConteudoBanner | ConteudoTexto | ConteudoLista;

function SecaoVideo({ c, titulo, primary }: { c: ConteudoVideo; titulo: string | null; primary: string }) {
  if (!c.url) return null;
  const embedUrl = c.url.includes("youtube.com/watch")
    ? c.url.replace("watch?v=", "embed/")
    : c.url.includes("youtu.be/")
    ? c.url.replace("youtu.be/", "www.youtube.com/embed/")
    : c.url;
  return (
    <div className="max-w-4xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-8">{titulo}</h2>}
      <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ paddingBottom: "56.25%" }}>
        <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen title={titulo ?? "vídeo"} />
      </div>
      {c.legenda && <p className="text-center mt-4 text-sm opacity-70">{c.legenda}</p>}
    </div>
  );
}

function SecaoPatrocinadores({ c, titulo }: { c: ConteudoLista; titulo: string | null }) {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-10">{titulo}</h2>}
      <div className="flex flex-wrap justify-center gap-8 items-center">
        {c.items?.map((item, i) => (
          <a key={i} href={item.siteUrl || "#"} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
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
      {titulo && <h2 className="text-3xl font-bold text-center mb-10">{titulo}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {c.items?.map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-4xl font-bold mb-2" style={{ color: primary }}>{item.numero}</p>
            <p className="text-sm opacity-70 font-medium uppercase tracking-wide">{item.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoDepoimentos({ c, titulo, primary }: { c: ConteudoLista; titulo: string | null; primary: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-10">{titulo}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {c.items?.map((item, i) => (
          <div key={i} className="rounded-2xl border p-6 shadow-sm">
            <p className="text-sm leading-relaxed mb-4 opacity-80">"{item.texto}"</p>
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
    <div className="max-w-3xl mx-auto px-4">
      {titulo && <h2 className="text-3xl font-bold text-center mb-10">{titulo}</h2>}
      <div className="space-y-4">
        {c.items?.map((item, i) => (
          <details key={i} className="rounded-xl border p-5 group cursor-pointer">
            <summary className="font-semibold text-sm list-none flex justify-between items-center">
              {item.pergunta}
              <span className="text-lg opacity-40 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed opacity-70">{item.resposta}</p>
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
      <p className="leading-relaxed whitespace-pre-line">{c.texto}</p>
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
      ? new Date(s.startTime).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
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
    const c = JSON.parse(s.conteudo || "{}") as ConteudoAny;
    const alignClass = s.align === "left" ? "text-left" : s.align === "right" ? "text-right" : "text-center";

    return (
      <section key={s.id} className={`${s.padding} ${alignClass}`} style={{ background: s.bgColor, color: s.textColor }}>
        {s.tipo === "video" && <SecaoVideo c={c as ConteudoVideo} titulo={s.titulo} primary={primary} />}
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
      <Navbar eventName={evento.name} primaryColor={primary} logoUrl={evento.logoUrl} />

      {/* Hero */}
      <section className="relative text-white py-28 px-4 overflow-hidden" style={{ background: secondary }}>
        {evento.bannerUrl && (
          <img src={evento.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: primary }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: primary }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {evento.logoUrl && (
            <img src={evento.logoUrl} alt="logo" className="h-14 object-contain mx-auto mb-6" />
          )}
          {dataFormatada && (
            <p className="font-medium mb-3 tracking-wide uppercase text-sm opacity-80">{dataFormatada}</p>
          )}
          <h1 className="text-5xl font-bold mb-4 leading-tight">{heroTitle}</h1>
          {evento.location && (
            <p className="text-lg mb-2 opacity-90 flex items-center justify-center gap-2">
              <span>📍</span> {evento.location}
            </p>
          )}
          {heroSubtitle && (
            <p className="max-w-2xl mx-auto mt-4 leading-relaxed opacity-80">{heroSubtitle}</p>
          )}
          <Link href="/inscricao" className="mt-8 inline-block text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg shadow-lg"
            style={{ background: primary }}>
            Garantir minha vaga
          </Link>
        </div>
      </section>

      {/* Programação fixa */}
      {sessoes.length > 0 && (
        <section id="programacao" className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Programação</h2>
            {dias.map(([dia, items], i) => (
              <div key={dia} className="mb-10">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: primary, borderColor: `${primary}33` }}>
                  Dia {i + 1} — {dia}
                </h3>
                <div className="space-y-3">
                  {items.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4 items-start">
                      <span className="font-bold text-sm min-w-[50px]" style={{ color: primary }}>
                        {s.startTime ? new Date(s.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {s.speakers.map((sp) => sp.name).join(", ")}
                          {s.speakers.length > 0 && s.location ? " · " : ""}
                          {s.location ?? ""}
                        </p>
                      </div>
                      {s.track && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium border" style={{ color: primary, background: `${primary}15`, borderColor: `${primary}30` }}>{s.track}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Palestrantes fixos */}
      {palestrantes.length > 0 && (
        <section id="palestrantes" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Palestrantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {palestrantes.map((p) => (
                <div key={p.id} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white" style={{ background: primary }}>
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.role && <p className="text-xs font-semibold mt-1 mb-2 uppercase tracking-wide" style={{ color: primary }}>{p.role}</p>}
                  {p.bio && <p className="text-sm text-gray-500 leading-relaxed">{p.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seções dinâmicas */}
      {secoes.map(renderSecao)}

      {/* CTA final */}
      <section className="py-16 px-4 text-white text-center" style={{ background: primary }}>
        <h2 className="text-3xl font-bold mb-4">Não perca esta oportunidade</h2>
        <p className="mb-8 text-lg opacity-80">Vagas limitadas. Inscreva-se agora e garanta sua participação.</p>
        <Link href="/inscricao" className="font-bold px-8 py-4 rounded-xl transition-colors text-lg inline-block shadow-lg bg-white"
          style={{ color: secondary }}>
          Fazer inscrição
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>{footerText}</p>
      </footer>
    </div>
  );
}
