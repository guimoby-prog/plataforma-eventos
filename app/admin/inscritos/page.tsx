import { prisma } from "@/lib/db";

export default async function Inscritos({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const { busca } = await searchParams;

  const inscritos = await prisma.participant.findMany({
    where: busca
      ? {
          OR: [
            { name: { contains: busca, mode: "insensitive" } },
            { email: { contains: busca, mode: "insensitive" } },
            { document: { contains: busca } },
          ],
        }
      : undefined,
    include: { category: true, event: true, checkins: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inscritos</h1>
          <p className="text-gray-500 text-sm mt-1">{inscritos.length} participante(s) encontrado(s)</p>
        </div>
      </div>

      {/* Busca */}
      <form method="GET" className="mb-6">
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por nome, e-mail ou CPF..."
          className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">E-mail</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check-in</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inscrito em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inscritos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhum inscrito encontrado.</td>
              </tr>
            )}
            {inscritos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.email}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{p.category.name}</span>
                </td>
                <td className="px-4 py-3">
                  {p.checkins.length > 0
                    ? <span className="text-green-600 font-medium">✓ Sim</span>
                    : <span className="text-gray-400">Não</span>}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
