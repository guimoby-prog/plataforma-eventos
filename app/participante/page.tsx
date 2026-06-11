"use client";

import { useState } from "react";
import Link from "next/link";

export default function AreaParticipante() {
  const [email, setEmail] = useState("");
  const [participante, setParticipante] = useState<{
    name: string;
    email: string;
    category: { name: string };
    qrCode: string;
    confirmedAt: string | null;
  } | null>(null);
  const [erro, setErro] = useState("");
  const [buscando, setBuscando] = useState(false);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setParticipante(null);
    setBuscando(true);
    try {
      const res = await fetch(`/api/participante?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Inscrição não encontrada.");
      }
      const data = await res.json();
      setParticipante(data);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao evento</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Área do Participante</h1>
          <p className="text-gray-500 mt-1">Consulte sua inscrição e acesse seu QR Code.</p>
        </div>

        {!participante && (
          <form onSubmit={buscar} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do cadastro</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>
            )}
            <button
              type="submit"
              disabled={buscando}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {buscando ? "Buscando..." : "Consultar inscrição"}
            </button>
          </form>
        )}

        {participante && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-blue-600">
                {participante.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{participante.name}</h2>
              <p className="text-sm text-gray-500">{participante.email}</p>
              <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                {participante.category.name}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-medium text-gray-600 mb-4">Seu QR Code de acesso</p>
              <img
                src={`/api/qrcode?codigo=${participante.qrCode}`}
                alt="QR Code de acesso"
                className="mx-auto w-48 h-48"
              />
              <p className="text-xs text-gray-400 mt-3">Apresente este QR Code na entrada do evento</p>
            </div>

            <button
              onClick={() => { setParticipante(null); setEmail(""); }}
              className="text-sm text-blue-600 hover:underline"
            >
              Consultar outro e-mail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
