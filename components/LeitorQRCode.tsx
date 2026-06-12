"use client";

import { useEffect, useRef, useState } from "react";

type ResultadoCheckin = {
  nome: string;
  categoria: string;
  status: "sucesso" | "jaRegistrado" | "erro";
  mensagem: string;
};

export default function LeitorQRCode() {
  const [ativo, setAtivo] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);
  const [erro, setErro] = useState("");
  const scannerRef = useRef<unknown>(null);
  const mountedRef = useRef(false);

  async function fazerCheckin(codigo: string) {
    if (processando) return;
    setProcessando(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: codigo }),
      });
      const data = await res.json();
      setResultado(data);
      // Pausa o scanner por 3 segundos para mostrar resultado
      setTimeout(() => {
        setResultado(null);
        setProcessando(false);
      }, 3000);
    } catch {
      setResultado({ nome: "", categoria: "", status: "erro", mensagem: "Erro de conexão." });
      setTimeout(() => { setResultado(null); setProcessando(false); }, 3000);
    }
  }

  async function iniciarScanner() {
    setErro("");
    setAtivo(true);
  }

  async function pararScanner() {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current as { stop: () => Promise<void> };
        await scanner.stop();
      } catch {}
      scannerRef.current = null;
    }
    setAtivo(false);
    setResultado(null);
    setProcessando(false);
  }

  useEffect(() => {
    if (!ativo) return;
    mountedRef.current = true;

    let scanner: unknown = null;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const typedScanner = scanner as {
          start: (
            constraint: unknown,
            config: unknown,
            onSuccess: (text: string) => void,
            onError?: () => void
          ) => Promise<void>;
        };

        await typedScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!processando) fazerCheckin(decodedText);
          },
          () => {}
        );
      } catch {
        setErro("Não foi possível acessar a câmera. Verifique as permissões.");
        setAtivo(false);
      }
    }

    startScanner();

    return () => {
      mountedRef.current = false;
      if (scanner) {
        try {
          const s = scanner as { stop: () => Promise<void> };
          s.stop().catch(() => {});
        } catch {}
      }
    };
  }, [ativo]);

  const cores = {
    sucesso: { bg: "bg-green-500", text: "text-white", icone: "✓" },
    jaRegistrado: { bg: "bg-yellow-500", text: "text-white", icone: "!" },
    erro: { bg: "bg-red-500", text: "text-white", icone: "✗" },
  };

  return (
    <div className="w-full">
      {!ativo ? (
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-6">Câmera desligada</p>
          <button
            onClick={iniciarScanner}
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ligar câmera
          </button>
          {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}
        </div>
      ) : (
        <div className="relative">
          {/* Overlay de resultado */}
          {resultado && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl ${cores[resultado.status].bg}`}>
              <div className="text-6xl font-bold text-white mb-3">{cores[resultado.status].icone}</div>
              {resultado.nome && <p className="text-white font-bold text-xl">{resultado.nome}</p>}
              {resultado.categoria && <p className="text-white/80 text-sm mt-1">{resultado.categoria}</p>}
              <p className="text-white/90 text-sm mt-3 text-center px-4">{resultado.mensagem}</p>
            </div>
          )}

          {/* Leitor */}
          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />

          {/* Mira decorativa */}
          {!resultado && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-white/60 rounded-xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>
          )}

          <button
            onClick={pararScanner}
            className="mt-4 w-full text-gray-400 text-sm hover:text-red-400 transition-colors py-2"
          >
            Desligar câmera
          </button>
        </div>
      )}
    </div>
  );
}
