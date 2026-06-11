import { prisma } from "@/lib/db";

async function getMetricas() {
  const [totalInscritos, totalEventos, totalCheckins] = await Promise.all([
    prisma.participant.count(),
    prisma.event.count(),
    prisma.checkin.count(),
  ]);
  return { totalInscritos, totalEventos, totalCheckins };
}

export default async function AdminDashboard() {
  const { totalInscritos, totalEventos, totalCheckins } = await getMetricas();

  const porCategoria = await prisma.participant.groupBy({
    by: ["categoryId"],
    _count: { id: true },
  });

  const ultimosInscritos = await prisma.participant.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { category: true, event: true },
  });

  const categorias = await prisma.category.findMany();
  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c.name]));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral da plataforma em tempo real</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total de Inscritos</p>
          <p className="text-4xl font-bold text-blue-600">{totalInscritos}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Eventos Cadastrados</p>
          <p className="text-4xl font-bold text-blue-600">{totalEventos}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Check-ins Realizados</p>
          <p className="text-4xl font-bold text-green-600">{totalCheckins}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos inscritos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Últimas Inscrições</h2>
            <a href="/admin/inscritos" className="text-xs text-blue-600 hover:underline">Ver todos →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {ultimosInscritos.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-400">Nenhuma inscrição ainda.</p>
            )}
            {ultimosInscritos.map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.email}</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {p.category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inscritos por categoria */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Inscritos por Categoria</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {porCategoria.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum dado ainda.</p>
            )}
            {porCategoria.map((item) => (
              <div key={item.categoryId} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 flex-1">{catMap[item.categoryId] ?? "—"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (item._count.id / totalInscritos) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-4 text-right">{item._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
