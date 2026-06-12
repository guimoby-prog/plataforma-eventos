import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const evento = await prisma.event.findFirst({ where: { isPublished: true } });

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Nenhum evento publicado no momento.
      </div>
    );
  }

  const [sessoes, palestrantes] = await Promise.all([
    prisma.session.findMany({
      where: { eventId: evento.id },
      include: { speakers: true },
      orderBy: [{ startTime: "asc" }],
    }),
    prisma.speaker.findMany({
      where: { eventId: evento.id },
      orderBy: { name: "asc" },
    }),
  ]);

  // Agrupa sessões por dia
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar eventName={evento.name} />

      {/* Hero */}
      <section className="relative bg-[#005C2E] text-white py-28 px-4 overflow-hidden">
        {/* Detalhe decorativo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A859] opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00A859] opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00A859]/30 border border-[#00A859] rounded-full px-4 py-1.5 mb-6">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#00A859"/><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z" fill="white"/></svg>
            <span className="text-sm font-semibold text-green-200 uppercase tracking-wider">Unimed</span>
          </div>
          {dataFormatada && (
            <p className="text-green-200 font-medium mb-3 tracking-wide uppercase text-sm">{dataFormatada}</p>
          )}
          <h1 className="text-5xl font-bold mb-4 leading-tight">{evento.name}</h1>
          {evento.location && (
            <p className="text-green-100 text-lg mb-2 flex items-center justify-center gap-2">
              <span>📍</span> {evento.location}
            </p>
          )}
          {evento.description && (
            <p className="text-green-200 max-w-2xl mx-auto mt-4 leading-relaxed">{evento.description}</p>
          )}
          <Link href="/inscricao" className="mt-8 inline-block bg-[#00A859] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#008C45] transition-colors text-lg shadow-lg border border-[#00A859]">
            Garantir minha vaga
          </Link>
        </div>
      </section>

      {/* Programação */}
      {sessoes.length > 0 && (
        <section id="programacao" className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Programação</h2>
            {dias.map(([dia, items], i) => (
              <div key={dia} className="mb-10">
                <h3 className="text-lg font-semibold text-[#00A859] mb-4 border-b border-green-100 pb-2">
                  Dia {i + 1} — {dia}
                </h3>
                <div className="space-y-3">
                  {items.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4 items-start">
                      <span className="text-[#00A859] font-bold text-sm min-w-[50px]">
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
                        <span className="text-xs bg-green-50 text-[#00A859] px-2 py-1 rounded-full font-medium border border-green-100">{s.track}</span>
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
        <section id="palestrantes" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Palestrantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {palestrantes.map((p) => (
                <div key={p.id} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[#00A859]">
                    {p.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.role && <p className="text-xs text-[#00A859] font-semibold mt-1 mb-2 uppercase tracking-wide">{p.role}</p>}
                  {p.bio && <p className="text-sm text-gray-500 leading-relaxed">{p.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="py-16 px-4 bg-[#00A859] text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Não perca esta oportunidade</h2>
        <p className="text-green-100 mb-8 text-lg">Vagas limitadas. Inscreva-se agora e garanta sua participação.</p>
        <Link href="/inscricao" className="bg-white text-[#005C2E] font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors text-lg inline-block shadow-lg">
          Fazer inscrição
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} {evento.name}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
