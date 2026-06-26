import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Eventos() {
  const eventos = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">{eventos.length} evento(s) cadastrado(s)</p>
        </div>
        <Link href="/admin/eventos/novo" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          + Novo evento
        </Link>
      </div>

      <div className="space-y-4">
        {eventos.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
            Nenhum evento cadastrado ainda.
          </div>
        )}
        {eventos.map((evento) => (
          <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-semibold text-gray-900 truncate">{evento.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${evento.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {evento.isPublished ? "Publicado" : "Rascunho"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(evento.startDate).toLocaleDateString("pt-BR")} → {new Date(evento.endDate).toLocaleDateString("pt-BR")}
              </p>
              {evento.location && <p className="text-sm text-gray-400 mt-0.5">{evento.location}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/eventos/${evento.id}/webapp`} className="text-sm font-bold text-indigo-500 hover:underline whitespace-nowrap">
                📱 Webapp
              </Link>
              <Link href={`/admin/eventos/${evento.id}/builder`} className="text-sm font-bold text-orange-500 hover:underline whitespace-nowrap">
                🏗️ Builder
              </Link>
              <Link href={`/admin/eventos/${evento.id}/secoes`} className="text-sm font-medium text-purple-600 hover:underline whitespace-nowrap">
                🧩 Seções
              </Link>
              <Link href={`/admin/eventos/${evento.id}/visual`} className="text-sm font-medium text-[#00A859] hover:underline whitespace-nowrap">
                🎨 Visual
              </Link>
              <Link href={`/admin/eventos/${evento.id}`} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
