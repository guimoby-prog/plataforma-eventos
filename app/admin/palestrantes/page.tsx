import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Palestrantes() {
  const palestrantes = await prisma.speaker.findMany({
    include: { event: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Palestrantes</h1>
          <p className="text-gray-500 text-sm mt-1">{palestrantes.length} palestrante(s) cadastrado(s)</p>
        </div>
        <Link href="/admin/palestrantes/novo" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          + Novo palestrante
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Papel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Evento</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bio</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {palestrantes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhum palestrante cadastrado ainda.</td>
              </tr>
            )}
            {palestrantes.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {p.name.charAt(0)}
                    </div>
                    {p.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{p.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[160px]">{p.event.name}</td>
                <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">{p.bio ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/palestrantes/${p.id}`} className="text-blue-600 hover:underline text-xs">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
