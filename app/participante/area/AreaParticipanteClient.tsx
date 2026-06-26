"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import LeitorQrFeira from "./LeitorQrFeira";

type Sessao = {
  id: string;
  title: string;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  speakers: { name: string }[];
};

type Visita = {
  id: string;
  createdAt: string;
  expositor: { nome: string; pontos: number };
};

type Checkin = {
  id: string;
  checkedInAt: string;
  session?: { title: string } | null;
};

type RankingItem = { id: string; nome: string; total: number };

type Badge = { id: string; emoji: string; titulo: string; descricao: string; conquistado: boolean };

type Participante = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  qrCode: string;
  fotoFace: string | null;
  category: { name: string };
  event: { name: string };
  visitas: Visita[];
  checkins: Checkin[];
};

type Props = {
  participante: Participante;
  sessoes: Sessao[];
  ranking: RankingItem[];
  meusPontos: number;
  minhaPos: number;
  badges: Badge[];
  aoVivo: Sessao[];
  proximas: Sessao[];
};

const TABS = [
  { id: "inicio", emoji: "🏠", label: "Início" },
  { id: "programacao", emoji: "📅", label: "Programação" },
  { id: "feira", emoji: "🏪", label: "Feira de Negócios" },
  { id: "conquistas", emoji: "🏅", label: "Conquistas" },
  { id: "credenciamento", emoji: "🪪", label: "Credenciamento" },
];

export default function AreaParticipanteClient({
  participante, sessoes, ranking, meusPontos, minhaPos, badges, aoVivo, proximas,
}: Props) {
  const [aba, setAba] = useState("inicio");
  const [menuAberto, setMenuAberto] = useState(false);

  const inicial = participante.name.charAt(0).toUpperCase();
  const foto = participante.fotoFace;

  function Avatar({ size }: { size: "sm" | "md" | "lg" }) {
    const sizes = { sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-lg", lg: "w-14 h-14 text-2xl" };
    if (foto) return <img src={foto} alt={participante.name} className={`${sizes[size]} rounded-full object-cover border-2 border-white/30 shrink-0`} />;
    return <div className={`${sizes[size]} rounded-full bg-[#00A859] flex items-center justify-center text-white font-bold shrink-0`}>{inicial}</div>;
  }
  const conquistados = badges.filter((b) => b.conquistado).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-gray-500 hover:text-gray-800 p-1"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuAberto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <Link href="/" className="text-[#00A859] font-bold text-lg tracking-tight">Área do Participante</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-800 leading-tight">{participante.name}</p>
            <p className="text-xs text-gray-400">{participante.event.name}</p>
          </div>
          <Avatar size="sm" />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 pt-14 md:pt-0 flex flex-col
          transition-transform duration-200
          ${menuAberto ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          {/* Perfil na sidebar */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{participante.name}</p>
                <p className="text-xs text-gray-400 truncate">{participante.category.name}</p>
              </div>
            </div>
            {/* Mini stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-[#00A859]">{meusPontos}</p>
                <p className="text-[10px] text-gray-400">Pontos</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-[#00A859]">{minhaPos > 0 ? `#${minhaPos}` : "—"}</p>
                <p className="text-[10px] text-gray-400">Ranking</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-[#00A859]">{conquistados}</p>
                <p className="text-[10px] text-gray-400">Badges</p>
              </div>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setAba(tab.id); setMenuAberto(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                  ${aba === tab.id
                    ? "bg-[#00A859] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span className="text-base">{tab.emoji}</span>
                {tab.label}
                {tab.id === "programacao" && aoVivo.length > 0 && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* Rodapé sidebar */}
          <div className="p-3 border-t border-gray-100">
            <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 px-3 py-2">
              ← Voltar ao evento
            </Link>
          </div>
        </aside>

        {/* Overlay mobile */}
        {menuAberto && (
          <div className="fixed inset-0 bg-black/30 z-10 md:hidden" onClick={() => setMenuAberto(false)} />
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl">

          {/* ── INÍCIO ── */}
          {aba === "inicio" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Olá, {participante.name.split(" ")[0]}! 👋</h1>
                <p className="text-gray-500 text-sm mt-1">{participante.event.name}</p>
              </div>

              {/* Dados do participante */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Meus dados</h2>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Nome</span><p className="font-medium text-gray-800 mt-0.5">{participante.name}</p></div>
                  <div><span className="text-gray-400">E-mail</span><p className="font-medium text-gray-800 mt-0.5">{participante.email}</p></div>
                  {participante.phone && <div><span className="text-gray-400">Telefone</span><p className="font-medium text-gray-800 mt-0.5">{participante.phone}</p></div>}
                  {participante.document && <div><span className="text-gray-400">CPF</span><p className="font-medium text-gray-800 mt-0.5">{participante.document}</p></div>}
                  <div><span className="text-gray-400">Categoria</span><p className="font-medium text-gray-800 mt-0.5">{participante.category.name}</p></div>
                </div>
              </div>

              {/* Atalhos rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TABS.slice(1).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAba(tab.id)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:border-[#00A859] hover:shadow-md transition-all text-center"
                  >
                    <span className="text-3xl">{tab.emoji}</span>
                    <span className="text-xs font-medium text-gray-600">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Sessão ao vivo */}
              {aoVivo.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                    Ao vivo agora
                  </h2>
                  {aoVivo.map((s) => (
                    <Link key={s.id} href={`/participante/sessao/${s.id}`}
                      className="block bg-white rounded-2xl border-2 border-[#00A859] p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{s.title}</p>
                          {s.speakers.length > 0 && <p className="text-sm text-gray-500 mt-0.5">{s.speakers.map((sp) => sp.name).join(", ")}</p>}
                          {s.location && <p className="text-xs text-gray-400 mt-0.5">📍 {s.location}</p>}
                        </div>
                        <span className="shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">AO VIVO</span>
                      </div>
                      <p className="mt-3 text-[#00A859] text-sm font-medium">Participar → perguntas, enquetes e avaliação</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROGRAMAÇÃO ── */}
          {aba === "programacao" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">📅 Programação</h1>

              {aoVivo.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" /> Ao vivo agora
                  </p>
                  {aoVivo.map((s) => (
                    <Link key={s.id} href={`/participante/sessao/${s.id}`}
                      className="block bg-white rounded-2xl border-2 border-[#00A859] p-5 shadow-sm hover:shadow-md transition-shadow mb-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{s.title}</p>
                          {s.speakers.length > 0 && <p className="text-sm text-gray-500 mt-0.5">{s.speakers.map(sp => sp.name).join(", ")}</p>}
                          {s.location && <p className="text-xs text-gray-400 mt-0.5">📍 {s.location}</p>}
                        </div>
                        <span className="shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full h-fit">AO VIVO</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {proximas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Próximas sessões</p>
                  <div className="space-y-2">
                    {proximas.map((s) => (
                      <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex gap-4 items-start">
                        <div className="text-center min-w-[52px]">
                          <p className="text-sm font-bold text-[#00A859]">
                            {s.startTime ? new Date(s.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                          {s.speakers.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{s.speakers.map(sp => sp.name).join(", ")}</p>}
                          {s.location && <p className="text-xs text-gray-400 mt-0.5">📍 {s.location}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Todas as sessões</p>
                <div className="space-y-2">
                  {sessoes.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex gap-4 items-start">
                      <div className="text-center min-w-[52px]">
                        <p className="text-xs font-bold text-[#00A859]">
                          {s.startTime ? new Date(s.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                        {s.speakers.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{s.speakers.map(sp => sp.name).join(", ")}</p>}
                        {s.location && <p className="text-xs text-gray-400 mt-0.5">📍 {s.location}</p>}
                      </div>
                      <Link href={`/participante/sessao/${s.id}`} className="text-xs text-[#00A859] font-medium hover:underline shrink-0">
                        Participar →
                      </Link>
                    </div>
                  ))}
                  {sessoes.length === 0 && <p className="text-sm text-gray-400">Nenhuma sessão cadastrada ainda.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── FEIRA DE NEGÓCIOS ── */}
          {aba === "feira" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">🏪 Feira de Negócios</h1>

              {/* Pontuação */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Minha pontuação</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-green-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-[#00A859]">{meusPontos}</p>
                    <p className="text-xs text-gray-500 mt-1">Pontos</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-[#00A859]">{participante.visitas.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Estandes</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-[#00A859]">{minhaPos > 0 ? `#${minhaPos}` : "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">Posição</p>
                  </div>
                </div>

                {participante.visitas.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Estandes visitados</p>
                    <div className="space-y-2">
                      {participante.visitas.map((v) => (
                        <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                          <span className="text-sm text-gray-700 flex items-center gap-2"><span className="text-[#00A859]">✓</span>{v.expositor.nome}</span>
                          <span className="text-xs font-bold text-[#00A859]">+{v.expositor.pontos} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Visite estandes da feira e escaneie o QR Code para acumular pontos!</p>
                )}
              </div>

              {/* Leitor QR */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Escanear estande</h2>
                <LeitorQrFeira />
              </div>

              {/* Ranking */}
              {ranking.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Ranking geral</h2>
                  <div className="space-y-2">
                    {ranking.map((r, i) => (
                      <div key={r.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${r.id === participante.id ? "bg-green-50 border border-green-100" : "bg-gray-50"}`}>
                        <span className={`text-sm font-bold w-6 text-center ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}
                        </span>
                        <span className={`flex-1 text-sm ${r.id === participante.id ? "font-semibold text-[#00A859]" : "text-gray-700"}`}>
                          {r.nome}{r.id === participante.id ? " (você)" : ""}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{r.total} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CONQUISTAS ── */}
          {aba === "conquistas" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🏅 Conquistas</h1>
                <p className="text-gray-500 text-sm mt-1">{conquistados} de {badges.length} desbloqueadas</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map((b) => (
                  <div key={b.id} className={`flex flex-col items-center text-center gap-2 p-5 rounded-2xl border-2 transition-all
                    ${b.conquistado ? "border-yellow-300 bg-yellow-50 shadow-sm" : "border-gray-100 bg-white opacity-50 grayscale"}`}>
                    <span className="text-4xl">{b.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{b.titulo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{b.descricao}</p>
                    </div>
                    {b.conquistado
                      ? <span className="text-xs bg-yellow-200 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">✓ Conquistado</span>
                      : <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Bloqueado</span>
                    }
                  </div>
                ))}
              </div>

              {conquistados === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-4xl mb-3">🎮</p>
                  <p className="font-semibold text-gray-700">Nenhuma conquista ainda</p>
                  <p className="text-sm text-gray-400 mt-1">Visite estandes, avalie sessões e faça perguntas para desbloquear badges!</p>
                </div>
              )}
            </div>
          )}

          {/* ── CREDENCIAMENTO ── */}
          {aba === "credenciamento" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">🪪 Credenciamento</h1>

              {/* QR Code */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <h2 className="font-semibold text-gray-900 mb-4">Seu QR Code de acesso</h2>
                <img src={`/api/qrcode?codigo=${participante.qrCode}`} alt="QR Code" className="mx-auto w-56 h-56" />
                <p className="text-xs text-gray-400 mt-3">Apresente na entrada do evento para o credenciamento</p>
              </div>

              {/* Facial */}
              <Link href="/participante/facial"
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#00A859] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0">🤳</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Identificação Facial</p>
                  <p className="text-sm text-gray-500">Cadastre seu rosto para credenciamento sem QR Code</p>
                </div>
                <span className="text-gray-300 text-lg">→</span>
              </Link>

              {/* Histórico de presença */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Histórico de presença</h2>
                {participante.checkins.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhum check-in registrado ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {participante.checkins.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl px-4 py-2.5">
                        <span className="text-[#00A859]">✓</span>
                        <span className="text-gray-700 flex-1">{c.session?.title ?? "Entrada geral"}</span>
                        <span className="text-gray-400">{new Date(c.checkedInAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
