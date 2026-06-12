"use client";

import { useState, useRef } from "react";
import LeitorQRCode from "@/components/LeitorQRCode";

type ResultadoCheckin = {
  nome: string;
  categoria: string;
  status: "sucesso" | "jaRegistrado" | "erro";
  mensagem: string;
};

export default function Credenciamento() {
  const [aba, setAba] = useState<"camera" | "manual">("camera");
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);
  const [processando, setProcessando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  const cores = {
    sucesso: "bg-green-50 border-green-300 text-green-800",
    jaRegistrado: "bg-yellow-50 border-yellow-300 text-yellow-800",
    erro: "bg-red-50 border-red-300 text-red-800",
  };
  const icones = { sucesso: "✓", jaRegistrado: "!", erro: "✗" };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-1">Credenciamento</h1>
        <p className="text-gray-400 text-center mb-6 text-sm">Aponte a câmera para o QR Code do participante</p>

        {/* Abas */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setAba("camera")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${aba === "camera" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            📷 Câmera
          </button>
          <button
            onClick={() => setAba("manual")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${aba === "manual" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            ⌨️ Manual
          </button>
        </div>

        {/* Câmera */}
        {aba === "camera" && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <LeitorQRCode />
          </div>
        )}

        {/* Manual */}
        {aba === "manual" && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
            {resultado && (
              <div className={`rounded-2xl border-2 p-5 text-center ${cores[resultado.status]}`}>
                <div className="text-3xl font-bold mb-1">{icones[resultado.status]}</div>
                {resultado.nome && <p className="font-bold text-lg">{resultado.nome}</p>}
                {resultado.categoria && <p className="text-sm mt-0.5">{resultado.categoria}</p>}
                <p className="text-sm mt-2">{resultado.mensagem}</p>
              </div>
            )}
            <label className="block text-sm text-gray-400 mb-1">Código QR / leitura por pistola</label>
            <input
              ref={inputRef}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fazerCheckin(codigo)}
              placeholder="Aguardando leitura..."
              autoFocus
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <button
              onClick={() => fazerCheckin(codigo)}
              disabled={processando || !codigo.trim()}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              {processando ? "Registrando..." : "Registrar entrada"}
            </button>
            <p className="text-center text-gray-600 text-xs">
              Pressione <kbd className="bg-gray-700 px-2 py-0.5 rounded text-gray-400">Enter</kbd> para agilizar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
