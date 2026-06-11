import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCredenciamento() {
  const [totalInscritos, totalCheckins, porCategoria] = await Promise.all([
    prisma.participant.count(),
    prisma.checkin.count(),
    prisma.checkin.groupBy({
      by: ["participantId"],
    }).then(async () => {
      const result = await prisma.$queryRaw<{ nome: string; total: bigint }[]>`
        SELECT c.name as nome, COUNT(ch.id) as total
        FROM "Checkin" ch
        JOIN "Participant" p ON ch."participantId" = p.id
        JOIN "Category" c ON p."categoryId" = c.id
        GROUP BY c.name
        ORDER BY total DESC
      `;
      return result;
    }),
  ]);

  const percentual = totalInscritos > 0 ? Math.round((totalCheckins / totalInscritos) * 100) : 0;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credenciamento</h1>
          <p className="text-gray-500 mt-1">Acompanhe a entrada dos participantes em tempo real</p>
        </div>
        <Link
          href="/credenciamento"
          target="_blank"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Abrir leitor de QR Code →
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Total de inscritos</p>
          <p className="text-4xl font-bold text-gray-900">{totalInscritos}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Check-ins realizados</p>
          <p className="text-4xl font-bold text-green-600">{totalCheckins}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Presença</p>
          <p className="text-4xl font-bold text-blue-600">{percentual}%</p>
          <div className="mt-3 bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percentual}%` }} />
          </div>
        </div>
      </div>

      {/* Por categoria */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-ins por categoria</h2>
        {porCategoria.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum check-in registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {porCategoria.map((item) => (
              <div key={item.nome} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.nome}</span>
                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  {Number(item.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
