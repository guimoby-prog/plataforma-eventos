"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadImagem from "@/components/UploadImagem";

const FONTES = [
  { value: "Inter", label: "Inter — moderna e limpa" },
  { value: "Roboto", label: "Roboto — corporativa" },
  { value: "Playfair Display", label: "Playfair Display — elegante" },
  { value: "Montserrat", label: "Montserrat — impactante" },
  { value: "Lato", label: "Lato — amigável" },
  { value: "Poppins", label: "Poppins — jovem e dinâmica" },
];

type Evento = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  footerText: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
};

export default function EditorVisual({ evento }: { evento: Evento }) {
  const router = useRouter();
  const [form, setForm] = useState({
    primaryColor: evento.primaryColor,
    secondaryColor: evento.secondaryColor,
    fontFamily: evento.fontFamily,
    heroTitle: evento.heroTitle ?? evento.name,
    heroSubtitle: evento.heroSubtitle ?? (evento.description ?? ""),
    footerText: evento.footerText ?? "",
    logoUrl: evento.logoUrl ?? "",
    bannerUrl: evento.bannerUrl ?? "",
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    setSalvo(false);
  }

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/admin/eventos/${evento.id}/visual`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSalvando(false);
    setSalvo(true);
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Painel de edição */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h1 className="font-bold text-gray-900">Editor Visual</h1>
            <p className="text-xs text-gray-400 mt-0.5">{evento.name}</p>
          </div>
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-[#00A859] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008C45] disabled:opacity-50 transition-colors"
          >
            {salvando ? "Salvando..." : salvo ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* Cores */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cores</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="#00A859"
                  />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["#00A859","#1d4ed8","#7c3aed","#dc2626","#ea580c","#0891b2","#374151"].map(c => (
                    <button key={c} onClick={() => set("primaryColor", c)}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                      style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor secundária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => set("secondaryColor", e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.secondaryColor}
                    onChange={(e) => set("secondaryColor", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="#005C2E"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tipografia */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tipografia</h2>
            <div className="space-y-2">
              {FONTES.map((f) => (
                <label key={f.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.fontFamily === f.value ? "border-[#00A859] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input type="radio" name="font" value={f.value} checked={form.fontFamily === f.value}
                    onChange={() => set("fontFamily", f.value)} className="accent-[#00A859]" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: f.value }}>{f.value}</p>
                    <p className="text-xs text-gray-400">{f.label.split("—")[1]}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Textos do Hero */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Textos do Destaque</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título principal</label>
                <input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Nome do evento" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo / descrição</label>
                <textarea value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Descrição do evento..." />
              </div>
            </div>
          </section>

          {/* Imagens */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Imagens</h2>
            <div className="space-y-4">
              <UploadImagem label="Logo do evento" valor={form.logoUrl} onChange={(url) => set("logoUrl", url)} pasta="eventos" formato="quadrado" />
              <UploadImagem label="Banner de fundo" valor={form.bannerUrl} onChange={(url) => set("bannerUrl", url)} pasta="eventos" formato="retangulo" />
            </div>
          </section>

          {/* Footer */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Rodapé</h2>
            <input value={form.footerText} onChange={(e) => set("footerText", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="© 2026 Seu evento. Todos os direitos reservados." />
          </section>

        </div>
      </div>

      {/* Preview ao vivo */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10">
          <span className="text-sm font-medium text-gray-500">Preview ao vivo</span>
          <a href="/" target="_blank" className="text-xs text-[#00A859] hover:underline">Ver site →</a>
        </div>

        {/* Mini hotsite */}
        <div style={{ fontFamily: form.fontFamily }} className="text-sm">
          {/* Navbar */}
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="logo" className="h-7 object-contain" onError={(e) => (e.currentTarget.style.display="none")} />
              ) : (
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: form.primaryColor }}>
                  <span className="text-white font-bold text-xs">U</span>
                </div>
              )}
              <span className="font-bold text-gray-800 text-sm">{form.heroTitle || evento.name}</span>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: form.primaryColor }}>
              <span>Programação</span><span>Palestrantes</span>
              <span className="text-white px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: form.primaryColor }}>Inscreva-se</span>
            </div>
          </div>

          {/* Hero */}
          <div className="py-16 px-6 text-center relative overflow-hidden" style={{ background: form.secondaryColor }}>
            {form.bannerUrl && (
              <img src={form.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-20" onError={(e) => (e.currentTarget.style.display="none")} />
            )}
            <div className="relative z-10">
              <h1 className="text-2xl font-bold text-white mb-2">{form.heroTitle || evento.name}</h1>
              {evento.location && <p className="text-xs mb-2" style={{ color: `${form.primaryColor}99` }}>📍 {evento.location}</p>}
              <p className="text-xs text-white/70 max-w-sm mx-auto mb-4">{form.heroSubtitle || evento.description}</p>
              <span className="inline-block text-white text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: form.primaryColor }}>
                Garantir minha vaga
              </span>
            </div>
          </div>

          {/* Programação placeholder */}
          <div className="px-6 py-8 bg-gray-50">
            <h2 className="text-base font-bold text-center text-gray-800 mb-4">Programação</h2>
            <div className="space-y-2 max-w-lg mx-auto">
              {["09:00 — Abertura Oficial", "10:00 — Palestra Principal", "14:00 — Mesa Redonda"].map((s) => (
                <div key={s} className="bg-white rounded-lg px-4 py-2.5 flex items-center gap-3 border border-gray-100">
                  <span className="text-xs font-bold" style={{ color: form.primaryColor }}>{s.split("—")[0]}</span>
                  <span className="text-xs text-gray-700">{s.split("—")[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="py-8 px-6 text-center text-white" style={{ background: form.primaryColor }}>
            <h2 className="text-base font-bold mb-2">Não perca esta oportunidade</h2>
            <span className="inline-block text-xs font-semibold px-4 py-2 rounded-lg bg-white" style={{ color: form.secondaryColor }}>
              Fazer inscrição
            </span>
          </div>

          {/* Footer */}
          <div className="py-4 px-6 text-center text-xs text-gray-400 bg-gray-900">
            {form.footerText || `© ${new Date().getFullYear()} ${evento.name}. Todos os direitos reservados.`}
          </div>
        </div>
      </div>
    </div>
  );
}
