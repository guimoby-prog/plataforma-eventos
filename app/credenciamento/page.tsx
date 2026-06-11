"use client";

import { useState, useEffect, useRef } from "react";

type ResultadoCheckin = {
  nome: string;
  categoria: string;
  status: "sucesso" | "jaRegistrado" | "erro";
  mensagem: string;
};

export default function Credenciamento() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);
  const [processando, setProcessando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [resultado]);

  async function fazerCheckin(cod: string) {
    if (!cod.trim() || processando) return;
    setProcessando(true);
    setResultado(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: cod.trim() }),
      });
      const data = await res.json();
      setResultado(data);
    } catch {
      setResultado({ nome: "", categoria: "", status: "erro", mensagem: "Erro de conexão." });
    } finally {
      setProcessando(false);
      setCodigo("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") fazerCheckin(codigo);
  }

  const cores = {
    sucesso: "bg-green-50 border-green-300 text-green-800",
    jaRegistrado: "bg-yellow-50 border-yellow-300 text-yellow-800",
    erro: "bg-red-50 border-red-300 text-red-800",
  };

  const icones = { sucesso: "✓", jaRegistrado: "!", erro: "✗" };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Credenciamento</h1>
        <p className="text-gray-400 text-center mb-10 text-sm">Aponte o leitor ou a câmera para o QR Code do participante</p>

        {resultado && (
          <div className={`rounded-2xl border-2 p-6 mb-6 text-center ${cores[resultado.status]}`}>
            <div className="text-4xl font-bold mb-2">{icones[resultado.status]}</div>
            {resultado.nome && <p className="font-bold text-lg">{resultado.nome}</p>}
            {resultado.categoria && <p className="text-sm mt-1">{resultado.categoria}</p>}
            <p className="text-sm mt-2">{resultado.mensagem}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <label className="block text-sm text-gray-400 mb-1">Código QR / leitura manual</label>
          <input
            ref={inputRef}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Aguardando leitura..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={() => fazerCheckin(codigo)}
            disabled={processando || !codigo.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            {processando ? "Registrando..." : "Registrar entrada"}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Pressione <kbd className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">Enter</kbd> após a leitura para agilizar o credenciamento
        </p>
      </div>
    </div>
  );
}
