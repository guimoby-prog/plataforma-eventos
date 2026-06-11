import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Programacao() {
  const sessoes = await prisma.session.findMany({
    include: { event: true, speakers: true },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });

  const porDia = sessoes.reduce<Record<string, typeof sessoes>>((acc, s) => {
    const dia = s.day ?? "Sem dia";
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(s);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programação</h1>
          <p className="text-gray-500 text-sm mt-1">{sessoes.length} sessão(ões) cadastrada(s)</p>
        </div>
        <Link href="/admin/programacao/nova" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          + Nova sessão
        </Link>
      </div>

      {sessoes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
          Nenhuma sessão cadastrada ainda.
        </div>
      )}

      {Object.entries(porDia).map(([dia, items]) => (
        <div key={dia} className="mb-8">
          <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3 border-b border-blue-100 pb-2">{dia}</h2>
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                <div className="text-blue-600 font-bold text-sm min-w-[55px]">
                  {new Date(s.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {s.location && <span>{s.location} · </span>}
                    {s.speakers.length > 0 && <span>{s.speakers.map((sp) => sp.name).join(", ")}</span>}
                  </p>
                </div>
                {s.track && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap">{s.track}</span>
                )}
                <Link href={`/admin/programacao/${s.id}`} className="text-blue-600 hover:underline text-xs whitespace-nowrap">
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
