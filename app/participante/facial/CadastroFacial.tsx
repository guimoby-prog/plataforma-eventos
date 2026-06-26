"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Status = "idle" | "carregando" | "pronto" | "detectando" | "capturado" | "salvando" | "salvo" | "erro";

export default function CadastroFacial({ nome, jaTemFace, fotoAtual }: {
  nome: string;
  jaTemFace: boolean;
  fotoAtual: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [mensagem, setMensagem] = useState("");
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [descritores, setDescritores] = useState<number[] | null>(null);
  const [modelosOk, setModelosOk] = useState(false);

  async function carregarModelos() {
    setStatus("carregando");
    setMensagem("Carregando modelos de reconhecimento facial...");
    try {
      // Primeiro abre a câmera e muda status para "detectando" (renderiza o <video>)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setStatus("detectando");
      setMensagem("Carregando modelos de reconhecimento...");

      // Carrega modelos enquanto o vídeo já aparece
      const faceapi = await import("face-api.js");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setModelosOk(true);
      setMensagem("✅ Pronto! Posicione seu rosto e clique em Capturar.");
    } catch (e: unknown) {
      setStatus("erro");
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Permission") || msg.includes("NotAllowed") || msg.includes("denied")) {
        setMensagem("Permissão de câmera negada. Clique no ícone de câmera na barra do navegador e permita o acesso.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setMensagem("Nenhuma câmera encontrada neste dispositivo.");
      } else {
        setMensagem("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      }
    }
  }

  async function abrirCamera() {
    // mantido por compatibilidade — não usado mais
  }

  async function capturar() {
    if (!videoRef.current || !canvasRef.current) return;
    setStatus("detectando");
    setMensagem("Detectando rosto...");

    const faceapi = await import("face-api.js");
    const opcoes = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });

    const result = await faceapi
      .detectSingleFace(videoRef.current, opcoes)
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!result) {
      setMensagem("Nenhum rosto detectado. Certifique-se de estar bem iluminado e centralizado.");
      setStatus("detectando");
      return;
    }

    // Captura foto
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const foto = canvas.toDataURL("image/jpeg", 0.8);

    setFotoCapturada(foto);
    setDescritores(Array.from(result.descriptor));
    setStatus("capturado");
    setMensagem("Rosto capturado com sucesso! Revise a foto e confirme.");

    // Para a câmera
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  async function salvar() {
    if (!fotoCapturada || !descritores) return;
    setStatus("salvando");
    setMensagem("Salvando perfil facial...");
    const res = await fetch("/api/participante/facial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faceDescriptor: descritores, fotoFace: fotoCapturada }),
    });
    if (res.ok) {
      setStatus("salvo");
      setMensagem("Perfil facial cadastrado com sucesso!");
    } else {
      setStatus("erro");
      setMensagem("Erro ao salvar. Tente novamente.");
    }
  }

  function recapturar() {
    setFotoCapturada(null);
    setDescritores(null);
    setModelosOk(false);
    setStatus("idle");
    setMensagem("");
  }

  // Conecta o stream ao elemento <video> assim que ele aparecer no DOM
  useEffect(() => {
    if (status === "detectando" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <Link href="/participante/area" className="text-[#00A859] text-sm hover:underline">← Minha área</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#00A85915] flex items-center justify-center mx-auto mb-3 text-2xl">🪪</div>
            <h1 className="text-xl font-bold text-gray-900">Identificação Facial</h1>
            <p className="text-sm text-gray-500 mt-1">Olá, <strong>{nome}</strong>! Cadastre seu rosto para agilizar o credenciamento.</p>
          </div>

          {/* Foto atual */}
          {jaTemFace && status === "idle" && fotoAtual && (
            <div className="mb-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Foto cadastrada</p>
              <img src={fotoAtual} alt="Foto facial" className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-[#00A859]" />
              <p className="text-xs text-[#00A859] font-medium mt-2">✓ Identificação facial ativa</p>
            </div>
          )}

          {/* Área da câmera */}
          {status === "detectando" && (
            <div className="mb-4">
              <video ref={videoRef} autoPlay muted playsInline
                className="w-full rounded-2xl bg-gray-900 aspect-video object-cover" />
            </div>
          )}

          {/* Foto capturada para confirmar */}
          {status === "capturado" && fotoCapturada && (
            <div className="mb-4 text-center">
              <img src={fotoCapturada} alt="Captura" className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-[#00A859]" />
            </div>
          )}

          {/* Foto salva */}
          {status === "salvo" && fotoCapturada && (
            <div className="mb-4 text-center">
              <img src={fotoCapturada} alt="Captura" className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-[#00A859]" />
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Mensagem de status */}
          {mensagem && (
            <div className={`text-center text-sm py-3 px-4 rounded-xl mb-4 ${
              status === "erro" ? "bg-red-50 text-red-600" :
              status === "salvo" ? "bg-green-50 text-[#00A859]" :
              "bg-gray-50 text-gray-600"
            }`}>
              {status === "carregando" && <span className="animate-pulse">⏳ </span>}
              {mensagem}
            </div>
          )}

          {/* Botões */}
          <div className="space-y-3">
            {(status === "idle") && (
              <button onClick={carregarModelos}
                className="w-full bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors">
                {jaTemFace ? "Atualizar identificação facial" : "Iniciar cadastro facial"}
              </button>
            )}

            {status === "detectando" && (
              <button onClick={capturar} disabled={!modelosOk}
                className="w-full bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {modelosOk ? "📸 Capturar rosto" : "⏳ Carregando modelos..."}
              </button>
            )}

            {status === "capturado" && (
              <div className="flex gap-3">
                <button onClick={recapturar}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50">
                  Tirar outra
                </button>
                <button onClick={salvar}
                  className="flex-1 bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors">
                  Confirmar
                </button>
              </div>
            )}

            {status === "salvando" && (
              <button disabled className="w-full bg-[#00A859] text-white font-semibold py-3 rounded-xl opacity-50">
                Salvando...
              </button>
            )}

            {status === "salvo" && (
              <Link href="/participante/area"
                className="block w-full bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors text-center">
                Voltar para minha área
              </Link>
            )}

            {status === "erro" && (
              <button onClick={recapturar}
                className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50">
                Tentar novamente
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>🔒 Privacidade:</strong> Seu perfil facial é armazenado de forma segura e utilizado exclusivamente para agilizar seu credenciamento no evento. Os dados não são compartilhados com terceiros.
          </p>
        </div>
      </div>
    </div>
  );
}
