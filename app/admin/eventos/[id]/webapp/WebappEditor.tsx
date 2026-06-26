"use client";

import { useState } from "react";
import Link from "next/link";

type Config = {
  corPrimaria: string;
  corTopbar: string;
  corFundo: string;
  mensagemBoasVindas: string;
  abasVisiveis: string[];
  logoUrl: string;
  exibirNomeEvento: boolean;
  textoRodape: string;
};

const ABAS_DISPONIVEIS = [
  { id: "programacao", emoji: "📅", label: "Programação" },
  { id: "feira", emoji: "🏪", label: "Feira de Negócios" },
  { id: "conquistas", emoji: "🏅", label: "Conquistas" },
  { id: "credenciamento", emoji: "🪪", label: "Credenciamento" },
];

const DEFAULT_CONFIG: Config = {
  corPrimaria: "#00A859",
  corTopbar: "#ffffff",
  corFundo: "#f9fafb",
  mensagemBoasVindas: "",
  abasVisiveis: ["programacao", "feira", "conquistas", "credenciamento"],
  logoUrl: "",
  exibirNomeEvento: true,
  textoRodape: "",
};

type Props = {
  evento: {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string | null;
    config: Record<string, unknown>;
  };
};

export default function WebappEditor({ evento }: Props) {
  const [cfg, setCfg] = useState<Config>({
    ...DEFAULT_CONFIG,
    corPrimaria: evento.primaryColor,
    logoUrl: evento.logoUrl ?? "",
    ...(evento.config as Partial<Config>),
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function set<K extends keyof Config>(key: K, value: Config[K]) {
    setCfg((c) => ({ ...c, [key]: value }));
    setSalvo(false);
  }

  function toggleAba(id: string) {
    setCfg((c) => ({
      ...c,
      abasVisiveis: c.abasVisiveis.includes(id)
        ? c.abasVisiveis.filter((a) => a !== id)
        : [...c.abasVisiveis, id],
    }));
    setSalvo(false);
  }

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/admin/eventos/${evento.id}/webapp`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSalvando(false);
    setSalvo(true);
  }

  // Preview colors
  const topbarBg = cfg.corTopbar || "#ffffff";
  const primary = cfg.corPrimaria || "#00A859";
  const fundo = cfg.corFundo || "#f9fafb";

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📱 Webapp do Participante</h1>
          <p className="text-gray-500 text-sm mt-1">{evento.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/eventos/${evento.id}`} className="text-sm text-gray-500 hover:underline">← Voltar</Link>
          <button onClick={salvar} disabled={salvando}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {salvando ? "Salvando..." : salvo ? "✓ Salvo" : "Salvar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Painel de configuração ── */}
        <div className="space-y-6">

          {/* Cores */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">🎨 Cores</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Cor primária</p>
                  <p className="text-xs text-gray-400">Botões, destaques e ícones ativos</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={cfg.corPrimaria} onChange={(e) => set("corPrimaria", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <input type="text" value={cfg.corPrimaria} onChange={(e) => set("corPrimaria", e.target.value)}
                    className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Cor da topbar</p>
                  <p className="text-xs text-gray-400">Barra superior do webapp</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={cfg.corTopbar} onChange={(e) => set("corTopbar", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <input type="text" value={cfg.corTopbar} onChange={(e) => set("corTopbar", e.target.value)}
                    className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Cor de fundo</p>
                  <p className="text-xs text-gray-400">Fundo da área do participante</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={cfg.corFundo} onChange={(e) => set("corFundo", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <input type="text" value={cfg.corFundo} onChange={(e) => set("corFundo", e.target.value)}
                    className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono" />
                </div>
              </div>
            </div>
          </div>

          {/* Logo e identidade */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">🖼️ Identidade</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da logo no webapp</label>
                <input type="text" value={cfg.logoUrl} placeholder="https://... (deixe vazio para usar a logo do evento)"
                  onChange={(e) => set("logoUrl", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-6 rounded-full transition-colors ${cfg.exibirNomeEvento ? "bg-blue-600" : "bg-gray-200"}`}
                  onClick={() => set("exibirNomeEvento", !cfg.exibirNomeEvento)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.exibirNomeEvento ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Exibir nome do evento na topbar</span>
              </label>
            </div>
          </div>

          {/* Abas visíveis */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-1">📂 Abas visíveis</h2>
            <p className="text-xs text-gray-400 mb-4">A aba Início é sempre exibida</p>
            <div className="space-y-2">
              {ABAS_DISPONIVEIS.map((aba) => (
                <label key={aba.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${cfg.abasVisiveis.includes(aba.id) ? "bg-blue-600" : "bg-gray-200"}`}
                    onClick={() => toggleAba(aba.id)}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.abasVisiveis.includes(aba.id) ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <span className="text-base">{aba.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{aba.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Textos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">✏️ Textos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de boas-vindas</label>
                <textarea value={cfg.mensagemBoasVindas} rows={3}
                  placeholder="Ex: Bem-vindo ao Fórum Estratégico! Explore a programação, visite os estandes e aproveite ao máximo."
                  onChange={(e) => set("mensagemBoasVindas", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto do rodapé</label>
                <input type="text" value={cfg.textoRodape}
                  placeholder={`© ${new Date().getFullYear()} ${evento.name}`}
                  onChange={(e) => set("textoRodape", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Preview do webapp ── */}
        <div className="lg:sticky lg:top-8 h-fit">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preview — Área do Participante</p>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 bg-gray-800" style={{ maxWidth: 360, margin: "0 auto" }}>
            {/* Notch simulado */}
            <div className="bg-gray-800 h-6 flex items-center justify-center">
              <div className="w-20 h-3 bg-gray-900 rounded-full" />
            </div>

            {/* Topbar */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/10" style={{ background: topbarBg }}>
              <div className="flex items-center gap-2">
                {cfg.logoUrl ? (
                  <img src={cfg.logoUrl} alt="logo" className="h-6 object-contain" />
                ) : (
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: primary }}>
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </div>
                )}
                {cfg.exibirNomeEvento && (
                  <span className="text-[10px] font-bold truncate max-w-[110px]" style={{ color: topbarBg === "#ffffff" || topbarBg === "#fff" ? "#111" : "#fff" }}>
                    {evento.name}
                  </span>
                )}
              </div>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: primary }}>G</div>
            </div>

            {/* Layout */}
            <div className="flex" style={{ background: fundo, minHeight: 480 }}>
              {/* Sidebar */}
              <div className="w-[72px] bg-white border-r border-gray-100 flex flex-col py-3 gap-1 px-1.5">
                {[{ id: "inicio", emoji: "🏠", label: "Início" }, ...ABAS_DISPONIVEIS.filter(a => cfg.abasVisiveis.includes(a.id))].map((aba, i) => (
                  <div key={aba.id} className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-center ${i === 0 ? "text-white" : "text-gray-400"}`}
                    style={i === 0 ? { background: primary } : {}}>
                    <span className="text-base leading-none">{aba.emoji}</span>
                    <span className="text-[7px] font-medium leading-tight">{aba.label}</span>
                  </div>
                ))}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 p-3 overflow-hidden">
                <p className="text-[11px] font-bold text-gray-800 mb-0.5">Olá, Participante! 👋</p>
                {cfg.mensagemBoasVindas && (
                  <p className="text-[9px] text-gray-500 mb-2 leading-relaxed">{cfg.mensagemBoasVindas}</p>
                )}

                {/* Mini card dados */}
                <div className="bg-white rounded-xl p-2.5 mb-2 border border-gray-100">
                  <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Meus dados</p>
                  <div className="space-y-1">
                    {["Nome", "E-mail", "Categoria"].map((f) => (
                      <div key={f} className="flex gap-1">
                        <span className="text-[8px] text-gray-400 w-12">{f}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Atalhos rápidos */}
                <div className="grid grid-cols-2 gap-1.5">
                  {ABAS_DISPONIVEIS.filter(a => cfg.abasVisiveis.includes(a.id)).slice(0, 4).map((aba) => (
                    <div key={aba.id} className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col items-center gap-1">
                      <span className="text-lg">{aba.emoji}</span>
                      <span className="text-[7px] text-gray-500 text-center leading-tight">{aba.label}</span>
                    </div>
                  ))}
                </div>

                {/* Rodapé */}
                {cfg.textoRodape && (
                  <p className="text-[7px] text-gray-300 text-center mt-3">{cfg.textoRodape}</p>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            <Link href="/participante/area" target="_blank" className="hover:underline text-blue-500">Abrir webapp real →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
