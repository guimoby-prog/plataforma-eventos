"use client";

import { useRouter } from "next/navigation";

type Visita = {
  id: string;
  createdAt: Date;
  participant: { name: string; email: string };
};

type Expositor = {
  id: string;
  nome: string;
  email: string;
  pontos: number;
  descricao: string | null;
  visitas: Visita[];
};

export default function PainelExpositor({ expositor }: { expositor: Expositor }) {
  const router = useRouter();

  async function sair() {
    await fetch("/api/expositor/logout", { method: "POST" });
    router.push("/expositor/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Portal do Expositor</p>
          <h1 className="text-lg font-bold text-gray-900">{expositor.nome}</h1>
        </div>
        <button onClick={sair} className="text-sm text-gray-400 hover:text-gray-600 font-medium">Sair</button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-[#00A859]">{expositor.visitas.length}</p>
            <p className="text-sm text-gray-500 mt-1">Visitantes</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-[#00A859]">{expositor.pontos}</p>
            <p className="text-sm text-gray-500 mt-1">Pontos por visita</p>
          </div>
        </div>

        {expositor.descricao && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-600 leading-relaxed">{expositor.descricao}</p>
          </div>
        )}

        {/* Lista de visitantes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Visitantes do estande</h2>
          </div>
          {expositor.visitas.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">👀</p>
              <p className="text-sm">Nenhum visitante ainda.</p>
              <p className="text-xs mt-1">Os participantes aparecem aqui ao escanear seu QR Code.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {expositor.visitas.map((v) => (
                <div key={v.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{v.participant.name}</p>
                    <p className="text-xs text-gray-400">{v.participant.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(v.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {new Date(v.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
