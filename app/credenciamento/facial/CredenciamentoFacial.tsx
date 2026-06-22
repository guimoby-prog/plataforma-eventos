"use client";

import { useEffect, useRef, useState } from "react";

type Participante = {
  id: string;
  name: string;
  email: string;
  faceDescriptor: string;
  fotoFace: string | null;
  category: { name: string };
};

type Identificado = {
  participante: Participante;
  distancia: number;
} | null;

type Status = "idle" | "carregando" | "pronto" | "reconhecendo" | "confirmando" | "checkin" | "erro";

function distanciaEuclidiana(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((acc, val, i) => acc + Math.pow(val - b[i], 2), 0));
}

export default function CredenciamentoFacial() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [mensagem, setMensagem] = useState("");
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [identificado, setIdentificado] = useState<Identificado>(null);
  const [checkinFeito, setCheckinFeito] = useState<string | null>(null);

  async function iniciar() {
    setStatus("carregando");
    setMensagem("Carregando modelos de reconhecimento facial...");
    try {
      const faceapi = await import("face-api.js");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      // Carrega participantes com face cadastrada
      const res = await fetch("/api/credenciamento/facial");
      const data: Participante[] = await res.json();
      setParticipantes(data);

      if (data.length === 0) {
        setStatus("erro");
        setMensagem("Nenhum participante com identificação facial cadastrada.");
        return;
      }

      // Abre câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("reconhecendo");
      setMensagem(`Pronto! ${data.length} perfil(s) facial(is) carregado(s). Aponte a câmera para o participante.`);

      // Loop de reconhecimento
      intervalRef.current = setInterval(() => reconhecer(faceapi, data), 1500);
    } catch {
      setStatus("erro");
      setMensagem("Erro ao iniciar. Verifique a câmera e tente novamente.");
    }
  }

  async function reconhecer(faceapi: typeof import("face-api.js"), lista: Participante[]) {
    if (!videoRef.current || lista.length === 0) return;
    const opcoes = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
    const result = await faceapi.detectSingleFace(videoRef.current, opcoes).withFaceLandmarks(true).withFaceDescriptor();
    if (!result) return;

    const descLive = Array.from(result.descriptor);
    let melhor: { participante: Participante; distancia: number } | null = null;

    for (const p of lista) {
      const desc = JSON.parse(p.faceDescriptor) as number[];
      const dist = distanciaEuclidiana(descLive, desc);
      if (!melhor || dist < melhor.distancia) melhor = { participante: p, distancia: dist };
    }

    if (melhor && melhor.distancia < 0.5) {
      // Encontrou com boa confiança
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIdentificado(melhor);
      setStatus("confirmando");
      setMensagem("");
    }
  }

  async function confirmarCheckin() {
    if (!identificado) return;
    setStatus("checkin");
    const res = await fetch("/api/credenciamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: identificado.participante.id }),
    });
    if (res.ok) {
      setCheckinFeito(identificado.participante.name);
      setIdentificado(null);
      setTimeout(() => {
        setCheckinFeito(null);
        setStatus("reconhecendo");
        setMensagem("Aguardando próximo participante...");
        intervalRef.current = setInterval(() => {
          import("face-api.js").then((faceapi) => reconhecer(faceapi, participantes));
        }, 1500);
      }, 3000);
    }
  }

  function naoEuMesmo() {
    setIdentificado(null);
    setStatus("reconhecendo");
    setMensagem("Aguardando próximo participante...");
    intervalRef.current = setInterval(() => {
      import("face-api.js").then((faceapi) => reconhecer(faceapi, participantes));
    }, 1500);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const confianca = identificado ? Math.round((1 - identificado.distancia / 0.6) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">

        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Plataforma Eventos</p>
          <h1 className="text-white text-2xl font-bold">Credenciamento Facial</h1>
        </div>

        {/* Câmera */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

          {/* Overlay de status */}
          {status === "reconhecendo" && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-white text-sm">{mensagem}</p>
              </div>
            </div>
          )}

          {/* Frame de detecção */}
          {status === "reconhecendo" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/30 rounded-full" />
            </div>
          )}
        </div>

        {/* Check-in confirmado */}
        {checkinFeito && (
          <div className="bg-green-500 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-white font-bold text-xl">Check-in realizado!</p>
            <p className="text-green-100 mt-1">{checkinFeito}</p>
          </div>
        )}

        {/* Confirmação de identidade */}
        {status === "confirmando" && identificado && (
          <div className="bg-white rounded-2xl p-6">
            <p className="text-center text-sm text-gray-500 uppercase tracking-wide font-semibold mb-4">Participante identificado</p>
            <div className="flex items-center gap-4 mb-5">
              {identificado.participante.fotoFace ? (
                <img src={identificado.participante.fotoFace} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-[#00A859] shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#00A859] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {identificado.participante.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{identificado.participante.name}</p>
                <p className="text-sm text-gray-500">{identificado.participante.email}</p>
                <span className="inline-block mt-1 bg-green-50 text-[#00A859] text-xs font-medium px-2 py-0.5 rounded-full border border-green-100">
                  {identificado.participante.category.name}
                </span>
              </div>
            </div>

            {/* Barra de confiança */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Confiança do reconhecimento</span>
                <span className="font-semibold">{confianca}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${confianca}%`, background: confianca > 70 ? "#00A859" : "#f59e0b" }} />
              </div>
            </div>

            <p className="text-center text-sm font-semibold text-gray-700 mb-3">Esta é a pessoa correta?</p>
            <div className="flex gap-3">
              <button onClick={naoEuMesmo}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50">
                Não, tentar novamente
              </button>
              <button onClick={confirmarCheckin}
                className="flex-1 bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors">
                Sim, fazer check-in
              </button>
            </div>
          </div>
        )}

        {/* Mensagem e botão inicial */}
        {mensagem && status !== "reconhecendo" && (
          <div className={`rounded-2xl p-4 text-center text-sm ${status === "erro" ? "bg-red-900/50 text-red-300" : "bg-gray-800 text-gray-300"}`}>
            {status === "carregando" && <span className="animate-pulse">⏳ </span>}
            {mensagem}
          </div>
        )}

        {status === "idle" && (
          <button onClick={iniciar}
            className="w-full bg-[#00A859] text-white font-semibold py-4 rounded-xl hover:bg-[#008C45] transition-colors text-lg">
            🪪 Iniciar reconhecimento facial
          </button>
        )}

        {status === "erro" && (
          <button onClick={() => setStatus("idle")}
            className="w-full border border-gray-600 text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-800">
            Tentar novamente
          </button>
        )}

        <p className="text-center text-xs text-gray-600">
          {participantes.length > 0 && `${participantes.length} participante(s) com face cadastrada`}
        </p>
      </div>
    </div>
  );
}
