"use client";

import Link from "next/link";
import { useState } from "react";

type NavbarProps = {
  eventName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string | null;
};

export default function Navbar({ eventName, primaryColor = "#00A859", secondaryColor = "#005C2E", logoUrl }: NavbarProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10" style={{ background: secondaryColor }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: primaryColor }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z" fill="white" />
              </svg>
            </div>
          )}
          <div className="leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] block text-white/60">Unimed</span>
            <span className="text-sm font-bold text-white">{eventName}</span>
          </div>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <Link href="#programacao" className="hover:text-white transition-colors">Programação</Link>
          <Link href="#palestrantes" className="hover:text-white transition-colors">Palestrantes</Link>
          <Link href="#patrocinadores" className="hover:text-white transition-colors">Patrocinadores</Link>
          <Link href="#duvidas" className="hover:text-white transition-colors">Dúvidas</Link>
        </div>

        {/* Botões desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/participante/area" className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors">
            Entrar
          </Link>
          <Link href="/inscricao"
            className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-white"
            style={{ background: primaryColor }}>
            Inscreva-se →
          </Link>
        </div>

        {/* Botão mobile */}
        <button onClick={() => setMenuAberto(!menuAberto)} className="md:hidden text-white p-2 text-xl">
          {menuAberto ? "✕" : "☰"}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 space-y-3" style={{ background: secondaryColor }}>
          {[["#programacao", "Programação"], ["#palestrantes", "Palestrantes"], ["#patrocinadores", "Patrocinadores"], ["#duvidas", "Dúvidas"]].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenuAberto(false)}
              className="block text-white/80 hover:text-white text-sm font-medium py-1">{label}</Link>
          ))}
          <div className="pt-2 flex gap-3">
            <Link href="/participante/area" className="flex-1 text-center text-sm font-semibold text-white border border-white/30 py-2.5 rounded-xl">Entrar</Link>
            <Link href="/inscricao" className="flex-1 text-center text-sm font-bold py-2.5 rounded-xl text-white" style={{ background: primaryColor }}>Inscrever-se</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
