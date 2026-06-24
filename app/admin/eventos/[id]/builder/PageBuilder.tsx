"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import UploadImagem from "@/components/UploadImagem";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlocoTipo = "heading" | "texto" | "imagem" | "botao" | "video" | "divisor" | "espaco";

type Bloco = {
  id: string;
  tipo: BlocoTipo;
  // heading + texto
  texto?: string;
  fontSize?: string;
  fontWeight?: string;
  cor?: string;
  align?: string;
  // imagem
  src?: string;
  alt?: string;
  largura?: string;
  arredondado?: string;
  sombra?: boolean;
  // botao
  label?: string;
  href?: string;
  corFundo?: string;
  corTexto?: string;
  tamanho?: string;
  larguraTotal?: boolean;
  // video
  url?: string;
  // divisor
  corLinha?: string;
  espessura?: string;
  // espaco
  altura?: string;
};

type Coluna = { id: string; blocos: Bloco[] };

type Layout = "1" | "2-eq" | "2-wide-left" | "2-wide-right" | "3";

type ConteudoBuilder = {
  layout: Layout;
  colunas: Coluna[];
  bgColor: string;
  textColor: string;
  padding: string;
};

type SecaoRaw = {
  id: string;
  tipo: string;
  titulo: string | null;
  conteudo: string;
  ordem: number;
  visivel: boolean;
  bgColor: string;
  textColor: string;
  padding: string;
  align: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LAYOUTS: { id: Layout; label: string; cols: number; widths: string[] }[] = [
  { id: "1", label: "Full", cols: 1, widths: ["flex-1"] },
  { id: "2-eq", label: "½ ½", cols: 2, widths: ["flex-1", "flex-1"] },
  { id: "2-wide-left", label: "⅔ ⅓", cols: 2, widths: ["flex-[2]", "flex-1"] },
  { id: "2-wide-right", label: "⅓ ⅔", cols: 2, widths: ["flex-1", "flex-[2]"] },
  { id: "3", label: "⅓⅓⅓", cols: 3, widths: ["flex-1", "flex-1", "flex-1"] },
];

const PADDINGS = [
  { value: "py-4", label: "XS" },
  { value: "py-8", label: "S" },
  { value: "py-12", label: "M" },
  { value: "py-16", label: "L" },
  { value: "py-24", label: "XL" },
  { value: "py-32", label: "XXL" },
];

const TIPOS_BLOCO: { tipo: BlocoTipo; icon: string; label: string }[] = [
  { tipo: "heading", icon: "H", label: "Título" },
  { tipo: "texto", icon: "¶", label: "Texto" },
  { tipo: "imagem", icon: "🖼", label: "Imagem" },
  { tipo: "botao", icon: "→", label: "Botão" },
  { tipo: "video", icon: "▶", label: "Vídeo" },
  { tipo: "divisor", icon: "—", label: "Divisor" },
  { tipo: "espaco", icon: "↕", label: "Espaço" },
];

const FONT_SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
const FONT_WEIGHTS = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Médio" },
  { value: "semibold", label: "Semi" },
  { value: "bold", label: "Bold" },
  { value: "black", label: "Black" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function blocoVazio(tipo: BlocoTipo): Bloco {
  const defaults: Record<BlocoTipo, Partial<Bloco>> = {
    heading: { texto: "Título da seção", fontSize: "3xl", fontWeight: "bold", cor: "#111827", align: "left" },
    texto: { texto: "Digite seu texto aqui...", fontSize: "base", fontWeight: "normal", cor: "#4B5563", align: "left" },
    imagem: { src: "", alt: "", largura: "full", arredondado: "lg", sombra: false },
    botao: { label: "Saiba mais", href: "#", corFundo: "#00A859", corTexto: "#ffffff", tamanho: "md", larguraTotal: false },
    video: { url: "" },
    divisor: { corLinha: "#e5e7eb", espessura: "1" },
    espaco: { altura: "8" },
  };
  return { id: uid(), tipo, ...defaults[tipo] };
}

function secaoVazia(): ConteudoBuilder {
  return {
    layout: "1",
    colunas: [{ id: uid(), blocos: [] }],
    bgColor: "#ffffff",
    textColor: "#111827",
    padding: "py-16",
  };
}

function parseSecao(s: SecaoRaw): ConteudoBuilder | null {
  if (s.tipo !== "builder") return null;
  try {
    return JSON.parse(s.conteudo) as ConteudoBuilder;
  } catch {
    return secaoVazia();
  }
}

// ─── Block Preview ────────────────────────────────────────────────────────────

function BlocoPreview({ bloco, primary }: { bloco: Bloco; primary: string }) {
  const alignClass = bloco.align === "center" ? "text-center" : bloco.align === "right" ? "text-right" : "text-left";

  if (bloco.tipo === "heading") {
    return (
      <p className={`font-${bloco.fontWeight ?? "bold"} text-${bloco.fontSize ?? "2xl"} ${alignClass} leading-tight`}
        style={{ color: bloco.cor ?? "#111827" }}>
        {bloco.texto || "Título"}
      </p>
    );
  }
  if (bloco.tipo === "texto") {
    return (
      <p className={`text-${bloco.fontSize ?? "base"} font-${bloco.fontWeight ?? "normal"} ${alignClass} leading-relaxed whitespace-pre-line`}
        style={{ color: bloco.cor ?? "#4B5563" }}>
        {bloco.texto || "Texto..."}
      </p>
    );
  }
  if (bloco.tipo === "imagem") {
    if (!bloco.src) return (
      <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-sm border-2 border-dashed border-gray-200">
        Imagem não configurada
      </div>
    );
    const widthClass = bloco.largura === "3/4" ? "w-3/4" : bloco.largura === "1/2" ? "w-1/2" : bloco.largura === "1/3" ? "w-1/3" : "w-full";
    return (
      <div className={`${widthClass} mx-auto`}>
        <img src={bloco.src} alt={bloco.alt ?? ""} className={`w-full object-cover rounded-${bloco.arredondado ?? "lg"} ${bloco.sombra ? "shadow-lg" : ""}`} />
      </div>
    );
  }
  if (bloco.tipo === "botao") {
    const sizeClass = bloco.tamanho === "sm" ? "px-4 py-2 text-sm" : bloco.tamanho === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3";
    return (
      <div className={alignClass}>
        <span className={`inline-block font-semibold rounded-xl ${sizeClass} ${bloco.larguraTotal ? "w-full text-center" : ""}`}
          style={{ background: bloco.corFundo ?? "#00A859", color: bloco.corTexto ?? "#fff" }}>
          {bloco.label || "Botão"}
        </span>
      </div>
    );
  }
  if (bloco.tipo === "video") {
    if (!bloco.url) return (
      <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-sm border-2 border-dashed border-gray-200">
        URL do vídeo não configurada
      </div>
    );
    const embedUrl = bloco.url.includes("youtu.be/")
      ? bloco.url.replace("youtu.be/", "www.youtube.com/embed/")
      : bloco.url.replace("watch?v=", "embed/");
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
        <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
      </div>
    );
  }
  if (bloco.tipo === "divisor") {
    return <hr style={{ borderColor: bloco.corLinha ?? "#e5e7eb", borderTopWidth: `${bloco.espessura ?? 1}px` }} />;
  }
  if (bloco.tipo === "espaco") {
    return <div style={{ height: `${bloco.altura ?? 8}px` }} />;
  }
  return null;
}

// ─── Props Panel ──────────────────────────────────────────────────────────────

function PropsBloco({ bloco, onChange, primary }: { bloco: Bloco; onChange: (b: Bloco) => void; primary: string }) {
  function set(key: keyof Bloco, val: unknown) {
    onChange({ ...bloco, [key]: val });
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 mt-3";

  return (
    <div className="space-y-1">
      {/* Heading / Texto */}
      {(bloco.tipo === "heading" || bloco.tipo === "texto") && (
        <>
          <label className={labelCls}>Conteúdo</label>
          <textarea value={bloco.texto ?? ""} onChange={(e) => set("texto", e.target.value)} rows={3}
            className={`${inputCls} resize-none`} />

          <label className={labelCls}>Tamanho</label>
          <div className="flex flex-wrap gap-1">
            {FONT_SIZES.map((s) => (
              <button key={s} onClick={() => set("fontSize", s)}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${bloco.fontSize === s ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600 hover:border-[#00A859]"}`}>
                {s}
              </button>
            ))}
          </div>

          <label className={labelCls}>Peso</label>
          <div className="flex flex-wrap gap-1">
            {FONT_WEIGHTS.map((w) => (
              <button key={w.value} onClick={() => set("fontWeight", w.value)}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${bloco.fontWeight === w.value ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600 hover:border-[#00A859]"}`}>
                {w.label}
              </button>
            ))}
          </div>

          <label className={labelCls}>Alinhamento</label>
          <div className="flex gap-1">
            {[["left", "←"], ["center", "↔"], ["right", "→"]].map(([a, icon]) => (
              <button key={a} onClick={() => set("align", a)}
                className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${bloco.align === a ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {icon}
              </button>
            ))}
          </div>

          <label className={labelCls}>Cor do texto</label>
          <div className="flex gap-2">
            <input type="color" value={bloco.cor ?? "#111827"} onChange={(e) => set("cor", e.target.value)}
              className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <input type="text" value={bloco.cor ?? "#111827"} onChange={(e) => set("cor", e.target.value)}
              className={`${inputCls} flex-1 font-mono`} />
          </div>
        </>
      )}

      {/* Imagem */}
      {bloco.tipo === "imagem" && (
        <>
          <label className={labelCls}>Imagem</label>
          <UploadImagem valor={bloco.src ?? ""} onChange={(url) => set("src", url)} pasta="builder" formato="retangulo" />

          <label className={labelCls}>Texto alternativo</label>
          <input value={bloco.alt ?? ""} onChange={(e) => set("alt", e.target.value)} placeholder="Descrição da imagem" className={inputCls} />

          <label className={labelCls}>Largura</label>
          <div className="flex gap-1">
            {[["full", "100%"], ["3/4", "75%"], ["1/2", "50%"], ["1/3", "33%"]].map(([v, l]) => (
              <button key={v} onClick={() => set("largura", v)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${bloco.largura === v ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>

          <label className={labelCls}>Arredondamento</label>
          <div className="flex flex-wrap gap-1">
            {["none", "sm", "md", "lg", "xl", "2xl", "full"].map((r) => (
              <button key={r} onClick={() => set("arredondado", r)}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${bloco.arredondado === r ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {r}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={bloco.sombra ?? false} onChange={(e) => set("sombra", e.target.checked)} className="accent-[#00A859]" />
            <span className="text-sm text-gray-700">Sombra</span>
          </label>
        </>
      )}

      {/* Botão */}
      {bloco.tipo === "botao" && (
        <>
          <label className={labelCls}>Texto do botão</label>
          <input value={bloco.label ?? ""} onChange={(e) => set("label", e.target.value)} className={inputCls} />

          <label className={labelCls}>Link</label>
          <input value={bloco.href ?? "#"} onChange={(e) => set("href", e.target.value)} placeholder="https://..." className={inputCls} />

          <label className={labelCls}>Cor do fundo</label>
          <div className="flex gap-2">
            <input type="color" value={bloco.corFundo ?? "#00A859"} onChange={(e) => set("corFundo", e.target.value)}
              className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <input type="text" value={bloco.corFundo ?? "#00A859"} onChange={(e) => set("corFundo", e.target.value)} className={`${inputCls} flex-1 font-mono`} />
          </div>

          <label className={labelCls}>Cor do texto</label>
          <div className="flex gap-2">
            <input type="color" value={bloco.corTexto ?? "#ffffff"} onChange={(e) => set("corTexto", e.target.value)}
              className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <input type="text" value={bloco.corTexto ?? "#ffffff"} onChange={(e) => set("corTexto", e.target.value)} className={`${inputCls} flex-1 font-mono`} />
          </div>

          <label className={labelCls}>Tamanho</label>
          <div className="flex gap-1">
            {[["sm", "P"], ["md", "M"], ["lg", "G"]].map(([v, l]) => (
              <button key={v} onClick={() => set("tamanho", v)}
                className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${bloco.tamanho === v ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>

          <label className={labelCls}>Alinhamento</label>
          <div className="flex gap-1">
            {[["left", "←"], ["center", "↔"], ["right", "→"]].map(([a, icon]) => (
              <button key={a} onClick={() => set("align", a)}
                className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${bloco.align === a ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {icon}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={bloco.larguraTotal ?? false} onChange={(e) => set("larguraTotal", e.target.checked)} className="accent-[#00A859]" />
            <span className="text-sm text-gray-700">Largura total</span>
          </label>
        </>
      )}

      {/* Vídeo */}
      {bloco.tipo === "video" && (
        <>
          <label className={labelCls}>URL do YouTube / Vimeo</label>
          <input value={bloco.url ?? ""} onChange={(e) => set("url", e.target.value)}
            placeholder="https://youtube.com/watch?v=..." className={inputCls} />
        </>
      )}

      {/* Divisor */}
      {bloco.tipo === "divisor" && (
        <>
          <label className={labelCls}>Cor da linha</label>
          <div className="flex gap-2">
            <input type="color" value={bloco.corLinha ?? "#e5e7eb"} onChange={(e) => set("corLinha", e.target.value)}
              className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <input type="text" value={bloco.corLinha ?? "#e5e7eb"} onChange={(e) => set("corLinha", e.target.value)} className={`${inputCls} flex-1 font-mono`} />
          </div>
          <label className={labelCls}>Espessura</label>
          <div className="flex gap-1">
            {[["1", "1px"], ["2", "2px"], ["4", "4px"]].map(([v, l]) => (
              <button key={v} onClick={() => set("espessura", v)}
                className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${bloco.espessura === v ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Espaço */}
      {bloco.tipo === "espaco" && (
        <>
          <label className={labelCls}>Altura</label>
          <div className="flex flex-wrap gap-1">
            {[["4", "4px"], ["8", "8px"], ["12", "12px"], ["16", "16px"], ["24", "24px"], ["32", "32px"], ["48", "48px"], ["64", "64px"]].map(([v, l]) => (
              <button key={v} onClick={() => set("altura", v)}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${bloco.altura === v ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  eventoId: string;
  eventoNome: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  secoesIniciais: SecaoRaw[];
};

export default function PageBuilder({ eventoId, eventoNome, primaryColor, secondaryColor, fontFamily, secoesIniciais }: Props) {
  // Apenas seções do tipo "builder"
  const [secoes, setSecoes] = useState<(SecaoRaw & { _parsed: ConteudoBuilder })[]>(
    secoesIniciais
      .filter((s) => s.tipo === "builder")
      .map((s) => ({ ...s, _parsed: parseSecao(s) ?? secaoVazia() }))
  );

  const [secaoAtivaId, setSecaoAtivaId] = useState<string | null>(secoes[0]?.id ?? null);
  const [blocoAtivo, setBlocoAtivo] = useState<{ colunaId: string; blocoId: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [paletteAberta, setPaletteAberta] = useState<string | null>(null); // colunaId

  const secaoAtiva = secoes.find((s) => s.id === secaoAtivaId) ?? null;
  const colunaAtiva = secaoAtiva?._parsed.colunas.find((c) => c.id === blocoAtivo?.colunaId) ?? null;
  const blocoAtivoObj = colunaAtiva?.blocos.find((b) => b.id === blocoAtivo?.blocoId) ?? null;

  // ─── Mutations ───────────────────────────────────────────────────────────────

  function updateParsed(secaoId: string, fn: (p: ConteudoBuilder) => ConteudoBuilder) {
    setSecoes((prev) => prev.map((s) => s.id === secaoId ? { ...s, _parsed: fn(s._parsed) } : s));
    setSalvo(false);
  }

  function addSecao() {
    const nova: SecaoRaw & { _parsed: ConteudoBuilder } = {
      id: `novo-${uid()}`,
      tipo: "builder",
      titulo: null,
      conteudo: "{}",
      ordem: secoes.length,
      visivel: true,
      bgColor: "#ffffff",
      textColor: "#111827",
      padding: "py-16",
      align: "left",
      _parsed: secaoVazia(),
    };
    setSecoes((prev) => [...prev, nova]);
    setSecaoAtivaId(nova.id);
    setBlocoAtivo(null);
    setSalvo(false);
  }

  function deleteSecao(id: string) {
    if (!confirm("Excluir esta seção?")) return;
    setSecoes((prev) => prev.filter((s) => s.id !== id));
    if (secaoAtivaId === id) setSecaoAtivaId(secoes.find((s) => s.id !== id)?.id ?? null);
    setBlocoAtivo(null);
    setSalvo(false);
  }

  function moveSecao(id: string, dir: -1 | 1) {
    setSecoes((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
    setSalvo(false);
  }

  function updateLayout(secaoId: string, layout: Layout) {
    updateParsed(secaoId, (p) => {
      const info = LAYOUTS.find((l) => l.id === layout)!;
      const colunas: Coluna[] = Array.from({ length: info.cols }, (_, i) => p.colunas[i] ?? { id: uid(), blocos: [] });
      return { ...p, layout, colunas };
    });
    setBlocoAtivo(null);
  }

  function addBloco(secaoId: string, colunaId: string, tipo: BlocoTipo) {
    updateParsed(secaoId, (p) => ({
      ...p,
      colunas: p.colunas.map((c) => c.id === colunaId ? { ...c, blocos: [...c.blocos, blocoVazio(tipo)] } : c),
    }));
    setPaletteAberta(null);
  }

  function updateBloco(secaoId: string, colunaId: string, bloco: Bloco) {
    updateParsed(secaoId, (p) => ({
      ...p,
      colunas: p.colunas.map((c) => c.id === colunaId ? { ...c, blocos: c.blocos.map((b) => b.id === bloco.id ? bloco : b) } : c),
    }));
  }

  function deleteBloco(secaoId: string, colunaId: string, blocoId: string) {
    updateParsed(secaoId, (p) => ({
      ...p,
      colunas: p.colunas.map((c) => c.id === colunaId ? { ...c, blocos: c.blocos.filter((b) => b.id !== blocoId) } : c),
    }));
    if (blocoAtivo?.blocoId === blocoId) setBlocoAtivo(null);
  }

  function moveBloco(secaoId: string, colunaId: string, blocoId: string, dir: -1 | 1) {
    updateParsed(secaoId, (p) => ({
      ...p,
      colunas: p.colunas.map((c) => {
        if (c.id !== colunaId) return c;
        const idx = c.blocos.findIndex((b) => b.id === blocoId);
        if (idx + dir < 0 || idx + dir >= c.blocos.length) return c;
        const blocos = [...c.blocos];
        [blocos[idx], blocos[idx + dir]] = [blocos[idx + dir], blocos[idx]];
        return { ...c, blocos };
      }),
    }));
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  async function salvar() {
    setSalvando(true);
    for (let i = 0; i < secoes.length; i++) {
      const s = secoes[i];
      const body = {
        tipo: "builder",
        titulo: s.titulo,
        conteudo: JSON.stringify(s._parsed),
        ordem: i,
        visivel: s.visivel,
        bgColor: s._parsed.bgColor,
        textColor: s._parsed.textColor,
        padding: s._parsed.padding,
        align: "left",
      };
      if (s.id.startsWith("novo-")) {
        const res = await fetch(`/api/admin/eventos/${eventoId}/secoes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const nova = await res.json();
        setSecoes((prev) => prev.map((sec) => sec.id === s.id ? { ...sec, id: nova.id } : sec));
      } else {
        await fetch(`/api/admin/eventos/${eventoId}/secoes/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
    }
    setSalvando(false);
    setSalvo(true);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const layoutInfo = secaoAtiva ? LAYOUTS.find((l) => l.id === secaoAtiva._parsed.layout) ?? LAYOUTS[0] : null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100" style={{ fontFamily }}>

      {/* ── Painel esquerdo: lista de seções ── */}
      <div className="w-60 bg-gray-900 text-white flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-700">
          <Link href={`/admin/eventos`} className="text-xs text-gray-400 hover:text-white block mb-1">← Eventos</Link>
          <p className="font-bold text-sm truncate">{eventoNome}</p>
          <p className="text-xs text-gray-400 mt-0.5">Page Builder</p>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {secoes.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Nenhuma seção ainda.</p>
          )}
          {secoes.map((s, i) => (
            <div key={s.id}
              className={`rounded-lg px-3 py-2.5 cursor-pointer transition-colors group ${secaoAtivaId === s.id ? "bg-[#00A859] text-white" : "text-gray-300 hover:bg-gray-800"}`}
              onClick={() => { setSecaoAtivaId(s.id); setBlocoAtivo(null); }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate">Seção {i + 1}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => moveSecao(s.id, -1)} className="p-0.5 hover:text-white text-gray-400 text-xs">↑</button>
                  <button onClick={() => moveSecao(s.id, 1)} className="p-0.5 hover:text-white text-gray-400 text-xs">↓</button>
                  <button onClick={() => deleteSecao(s.id)} className="p-0.5 hover:text-red-400 text-gray-400 text-xs">✕</button>
                </div>
              </div>
              <p className="text-[10px] mt-0.5 opacity-60">{LAYOUTS.find((l) => l.id === s._parsed.layout)?.label ?? "—"} · {s._parsed.colunas.reduce((a, c) => a + c.blocos.length, 0)} bloco(s)</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700 space-y-2">
          <button onClick={addSecao}
            className="w-full text-xs font-semibold text-white border border-dashed border-gray-600 rounded-lg py-2.5 hover:border-[#00A859] hover:text-[#00A859] transition-colors">
            + Nova seção
          </button>
          <button onClick={salvar} disabled={salvando}
            className={`w-full text-xs font-bold py-2.5 rounded-lg transition-colors ${salvo ? "bg-green-600" : "bg-[#00A859] hover:bg-[#008C45]"} text-white disabled:opacity-60`}>
            {salvando ? "Salvando..." : salvo ? "✓ Salvo!" : "Salvar tudo"}
          </button>
          <Link href="/" target="_blank"
            className="block text-center text-xs text-gray-400 hover:text-white transition-colors py-1">
            Ver hotsite →
          </Link>
        </div>
      </div>

      {/* ── Canvas central ── */}
      <div className="flex-1 overflow-y-auto">
        {!secaoAtiva ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">🏗️</p>
              <p className="font-medium">Selecione ou crie uma seção</p>
              <button onClick={addSecao} className="mt-4 bg-[#00A859] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#008C45]">
                + Nova seção
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Toolbar da seção */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 flex-wrap shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Layout:</span>
              <div className="flex gap-1">
                {LAYOUTS.map((l) => (
                  <button key={l.id} onClick={() => updateLayout(secaoAtiva.id, l.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${secaoAtiva._parsed.layout === l.id ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600 hover:border-[#00A859]"}`}>
                    {l.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-2">Fundo:</span>
              <div className="flex gap-2 items-center">
                <input type="color" value={secaoAtiva._parsed.bgColor}
                  onChange={(e) => updateParsed(secaoAtiva.id, (p) => ({ ...p, bgColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
                <input type="text" value={secaoAtiva._parsed.bgColor}
                  onChange={(e) => updateParsed(secaoAtiva.id, (p) => ({ ...p, bgColor: e.target.value }))}
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono" />
              </div>

              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-2">Padding:</span>
              <div className="flex gap-1">
                {PADDINGS.map((p) => (
                  <button key={p.value} onClick={() => updateParsed(secaoAtiva.id, (pr) => ({ ...pr, padding: p.value }))}
                    className={`px-2 py-1 text-xs rounded-lg border transition-colors ${secaoAtiva._parsed.padding === p.value ? "bg-[#00A859] text-white border-[#00A859]" : "border-gray-200 text-gray-600"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview da seção */}
            <div className="p-6">
              <div className={`rounded-2xl overflow-hidden shadow-sm border-2 border-transparent`}
                style={{ background: secaoAtiva._parsed.bgColor }}>
                <div className={`${secaoAtiva._parsed.padding} px-8`}>
                  <div className={`flex gap-6`}>
                    {secaoAtiva._parsed.colunas.map((coluna, ci) => {
                      const width = layoutInfo?.widths[ci] ?? "flex-1";
                      return (
                        <div key={coluna.id} className={`${width} min-w-0 space-y-4`}>
                          {/* Blocos da coluna */}
                          {coluna.blocos.map((bloco, bi) => {
                            const isAtivo = blocoAtivo?.blocoId === bloco.id && blocoAtivo?.colunaId === coluna.id;
                            return (
                              <div key={bloco.id}
                                className={`relative group rounded-xl transition-all cursor-pointer ${isAtivo ? "ring-2 ring-[#00A859] ring-offset-2" : "hover:ring-1 hover:ring-gray-300 hover:ring-offset-1"}`}
                                onClick={() => setBlocoAtivo({ colunaId: coluna.id, blocoId: bloco.id })}>
                                {/* Toolbar do bloco */}
                                <div className={`absolute -top-3 right-2 z-10 flex gap-1 ${isAtivo ? "flex" : "hidden group-hover:flex"}`}>
                                  <button onClick={(e) => { e.stopPropagation(); moveBloco(secaoAtiva.id, coluna.id, bloco.id, -1); }}
                                    className="bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-900 shadow-sm">↑</button>
                                  <button onClick={(e) => { e.stopPropagation(); moveBloco(secaoAtiva.id, coluna.id, bloco.id, 1); }}
                                    className="bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-900 shadow-sm">↓</button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteBloco(secaoAtiva.id, coluna.id, bloco.id); }}
                                    className="bg-white border border-red-200 rounded-md px-1.5 py-0.5 text-xs text-red-400 hover:text-red-600 shadow-sm">✕</button>
                                </div>
                                {/* Label do tipo */}
                                {isAtivo && (
                                  <div className="absolute -top-3 left-2 z-10">
                                    <span className="bg-[#00A859] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                      {TIPOS_BLOCO.find((t) => t.tipo === bloco.tipo)?.label}
                                    </span>
                                  </div>
                                )}
                                <div className="p-3">
                                  <BlocoPreview bloco={bloco} primary={primaryColor} />
                                </div>
                              </div>
                            );
                          })}

                          {/* Botão de adicionar bloco */}
                          <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setPaletteAberta(paletteAberta === coluna.id ? null : coluna.id); }}
                              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-gray-300 hover:border-[#00A859] hover:text-[#00A859] transition-colors text-sm font-medium">
                              + Adicionar bloco
                            </button>
                            {paletteAberta === coluna.id && (
                              <div className="absolute left-0 right-0 top-12 z-20 bg-white rounded-2xl border border-gray-200 shadow-xl p-3 grid grid-cols-4 gap-2">
                                {TIPOS_BLOCO.map((t) => (
                                  <button key={t.tipo} onClick={() => addBloco(secaoAtiva.id, coluna.id, t.tipo)}
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                    <span className="text-xl">{t.icon}</span>
                                    <span className="text-[10px] text-gray-500 font-medium">{t.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Painel direito: propriedades ── */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-sm">
            {blocoAtivoObj
              ? `${TIPOS_BLOCO.find((t) => t.tipo === blocoAtivoObj.tipo)?.label ?? "Bloco"}`
              : "Propriedades"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {blocoAtivoObj ? "Edite as propriedades do bloco" : "Clique em um bloco para editar"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {blocoAtivoObj && colunaAtiva && secaoAtiva ? (
            <PropsBloco
              bloco={blocoAtivoObj}
              onChange={(b) => updateBloco(secaoAtiva.id, colunaAtiva.id, b)}
              primary={primaryColor}
            />
          ) : (
            <div className="text-center py-12 text-gray-300">
              <p className="text-4xl mb-2">←</p>
              <p className="text-sm">Clique em um bloco no canvas para editar suas propriedades</p>
            </div>
          )}
        </div>
        {blocoAtivoObj && (
          <div className="px-4 py-3 border-t border-gray-100">
            <button onClick={() => setBlocoAtivo(null)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
              Fechar painel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
