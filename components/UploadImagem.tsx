"use client";

import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  valor: string;
  onChange: (url: string) => void;
  label?: string;
  pasta?: string; // ex: "eventos", "palestrantes", "expositores"
  formato?: "quadrado" | "retangulo" | "livre";
};

export default function UploadImagem({ valor, onChange, label = "Imagem", pasta = "geral", formato = "livre" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErro("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    setErro("");

    const ext = file.name.split(".").pop();
    const nome = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("uploads").upload(nome, file, { upsert: true });

    if (error) {
      setErro("Erro ao fazer upload. Tente novamente.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(nome);
    onChange(data.publicUrl);
    setUploading(false);
  }

  const preview = valor;
  const isRetangulo = formato === "retangulo";
  const isQuadrado = formato === "quadrado";

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700 block">{label}</label>}

      {/* Preview */}
      {preview && (
        <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${isRetangulo ? "h-32" : isQuadrado ? "h-24 w-24" : "h-20"}`}>
          <img src={preview} alt="preview" className="w-full h-full object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 shadow text-xs border border-gray-200">
            ✕
          </button>
        </div>
      )}

      {/* Botão de upload */}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          {uploading ? (
            <><span className="animate-spin">⏳</span> Enviando...</>
          ) : (
            <><span>📁</span> {preview ? "Trocar imagem" : "Escolher imagem"}</>
          )}
        </button>
        {!preview && (
          <input
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ou cole uma URL..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]"
          />
        )}
      </div>

      {erro && <p className="text-xs text-red-500">{erro}</p>}
      <p className="text-xs text-gray-400">PNG, JPG ou WebP · Máximo 5MB</p>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
