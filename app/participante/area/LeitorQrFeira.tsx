"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Resultado = { nome: string; pontos: number; novo: boolean } | null;

export default function LeitorQrFeira() {
  const [ativo, setAtivo] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);
  const [erro, setErro] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lendoRef = useRef(false);

  useEffect(() => {
    if (!ativo) return;
    const id = "leitor-feira";
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (texto) => {
        if (lendoRef.current) return;
        lendoRef.current = true;

        // Extrai o parâmetro qr da URL escaneada
        let qrCode = texto;
        try {
          const url = new URL(texto);
          qrCode = url.searchParams.get("qr") ?? texto;
        } catch { /* não é URL, usa direto */ }

        const res = await fetch("/api/visita", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErro(data.error ?? "QR Code inválido");
        } else {
          setResultado({ nome: data.nome, pontos: data.pontos, novo: data.novo });
        }

        scanner.stop().then(() => { setAtivo(false); lendoRef.current = false; }).catch(() => {});
      },
      () => {}
    ).catch(() => { setErro("Não foi possível acessar a câmera."); setAtivo(false); });

    return () => { scanner.stop().catch(() => {}); };
  }, [ativo]);

  function abrir() {
    setResultado(null);
    setErro("");
    setAtivo(true);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">📷 Escanear estande</h2>
      <p className="text-xs text-gray-400 mb-4">Aponte para o QR Code do expositor para ganhar pontos</p>

      {resultado && (
        <div className={`rounded-xl p-4 mb-4 text-center ${resultado.novo ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"}`}>
          {resultado.novo ? (
            <>
              <p className="text-2xl mb-1">🎉</p>
              <p className="font-bold text-[#00A859]">+{resultado.pontos} pontos!</p>
              <p className="text-sm text-gray-600 mt-0.5">Visita ao estande <strong>{resultado.nome}</strong> registrada!</p>
            </>
          ) : (
            <>
              <p className="text-2xl mb-1">✅</p>
              <p className="font-semibold text-gray-700">Você já visitou <strong>{resultado.nome}</strong></p>
              <p className="text-sm text-gray-400 mt-0.5">Pontos já contabilizados anteriormente</p>
            </>
          )}
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-center text-sm text-red-600">{erro}</div>
      )}

      {ativo ? (
        <div className="space-y-3">
          <div id="leitor-feira" className="rounded-xl overflow-hidden" />
          <button onClick={() => { scannerRef.current?.stop().catch(() => {}); setAtivo(false); }}
            className="w-full border border-gray-200 text-gray-500 text-sm py-2.5 rounded-xl hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={abrir}
          className="w-full bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors text-sm">
          Abrir câmera
        </button>
      )}
    </div>
  );
}
