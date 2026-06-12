import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Moderacao() {
  const evento = await prisma.event.findFirst({ where: { isPublished: true } });
  if (!evento) return <div className="p-8 text-gray-400">Nenhum evento publicado.</div>;

  const agora = new Date();
  const sessoes = await prisma.session.findMany({
    where: { eventId: evento.id },
    include: {
      speakers: true,
      perguntas: { include: { participant: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      enquetes: { include: { opcoes: true, respostas: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { startTime: "asc" },
  });

  const aoVivo = sessoes.filter(s => s.startTime && s.endTime && s.startTime <= agora && s.endTime >= agora);
  const outras = sessoes.filter(s => !aoVivo.find(a => a.id === s.id));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Moderação ao Vivo</h1>
        <p className="text-gray-500 mt-1">Gerencie perguntas e enquetes em tempo real</p>
      </div>

      {aoVivo.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-700">
          Nenhuma sessão ao vivo no momento. Selecione uma sessão abaixo para moderar.
        </div>
      )}

      <div className="space-y-6">
        {[...aoVivo, ...outras].map((sessao) => {
          const isVivo = aoVivo.find(a => a.id === sessao.id);
          const pendentes = sessao.perguntas.filter(p => !p.aprovada);
          const aprovadas = sessao.perguntas.filter(p => p.aprovada);
          const enquete = sessao.enquetes[0];

          return (
            <div key={sessao.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isVivo ? "border-[#00A859]" : "border-gray-100"}`}>
              <div className={`px-6 py-4 flex items-center justify-between ${isVivo ? "bg-[#00A859]/5" : ""}`}>
                <div>
                  <div className="flex items-center gap-2">
                    {isVivo && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />}
                    <h2 className="font-semibold text-gray-900">{sessao.title}</h2>
                    {isVivo && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">AO VIVO</span>}
                  </div>
                  {sessao.speakers.length > 0 && <p className="text-sm text-gray-500">{sessao.speakers.map(s => s.name).join(", ")}</p>}
                </div>
                <Link href={`/admin/moderacao/${sessao.id}`}
                  className="bg-[#00A859] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008C45] transition-colors">
                  Moderar →
                </Link>
              </div>

              <div className="px-6 py-3 border-t border-gray-50 flex gap-6 text-sm text-gray-500">
                <span>💬 {pendentes.length} pergunta(s) pendente(s)</span>
                <span>✓ {aprovadas.length} aprovada(s)</span>
                <span>📊 {enquete ? "1 enquete ativa" : "sem enquete"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
