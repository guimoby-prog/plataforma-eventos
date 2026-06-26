import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import LeitorQrFeira from "./LeitorQrFeira";

export const dynamic = "force-dynamic";

export default async function AreaParticipante() {
  const cookieStore = await cookies();
  const participanteId = cookieStore.get("participante_id")?.value;
  if (!participanteId) redirect("/login");

  const participante = await prisma.participant.findUnique({
    where: { id: participanteId },
    include: {
      category: true,
      event: true,
      checkins: { include: { session: true } },
      visitas: { include: { expositor: { select: { nome: true, pontos: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!participante) redirect("/login");

  const agora = new Date();
  const sessoes = await prisma.session.findMany({
    where: { eventId: participante.eventId },
    include: { speakers: true },
    orderBy: { startTime: "asc" },
  });

  // Ranking dos participantes do mesmo evento
  const todasVisitas = await prisma.visitaExpositor.findMany({
    where: { expositor: { eventId: participante.eventId } },
    include: { expositor: { select: { pontos: true } }, participant: { select: { id: true, name: true } } },
  });

  const pontosMap = new Map<string, { nome: string; total: number }>();
  for (const v of todasVisitas) {
    const entry = pontosMap.get(v.participantId) ?? { nome: v.participant.name, total: 0 };
    entry.total += v.expositor.pontos;
    pontosMap.set(v.participantId, entry);
  }
  const ranking = Array.from(pontosMap.entries())
    .map(([id, d]) => ({ id, nome: d.nome, total: d.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const meusPontos = participante.visitas.reduce((acc, v) => acc + v.expositor.pontos, 0);
  const minhaPos = ranking.findIndex((r) => r.id === participanteId) + 1;

  // Dados para badges
  const totalExpositores = await prisma.expositor.count({ where: { eventId: participante.eventId } });
  const minhaAvaliacao = await prisma.avaliacao.findFirst({ where: { participantId: participanteId } });
  const minhaPergunta = await prisma.pergunta.findFirst({ where: { participantId: participanteId, aprovada: true } });

  type Badge = { id: string; emoji: string; titulo: string; descricao: string; conquistado: boolean };
  const badges: Badge[] = [
    {
      id: "primeiro-estande",
      emoji: "🥇",
      titulo: "Pioneiro",
      descricao: "Visitou o primeiro estande",
      conquistado: participante.visitas.length >= 1,
    },
    {
      id: "tres-estandes",
      emoji: "🔥",
      titulo: "Em chamas",
      descricao: "Visitou 3 estandes",
      conquistado: participante.visitas.length >= 3,
    },
    {
      id: "cinco-estandes",
      emoji: "⚡",
      titulo: "Networker",
      descricao: "Visitou 5 estandes",
      conquistado: participante.visitas.length >= 5,
    },
    {
      id: "todos-estandes",
      emoji: "🎯",
      titulo: "Explorador",
      descricao: "Visitou todos os estandes",
      conquistado: totalExpositores > 0 && participante.visitas.length >= totalExpositores,
    },
    {
      id: "avaliou-sessao",
      emoji: "⭐",
      titulo: "Crítico",
      descricao: "Avaliou uma sessão",
      conquistado: !!minhaAvaliacao,
    },
    {
      id: "pergunta-aprovada",
      emoji: "💬",
      titulo: "Questionador",
      descricao: "Teve uma pergunta aprovada",
      conquistado: !!minhaPergunta,
    },
    {
      id: "top3",
      emoji: "🏆",
      titulo: "Pódio",
      descricao: "Chegou ao top 3 do ranking",
      conquistado: minhaPos >= 1 && minhaPos <= 3,
    },
  ];

  const aoVivo = sessoes.filter(
    (s) => s.startTime && s.endTime && s.startTime <= agora && s.endTime >= agora
  );
  const proximas = sessoes.filter((s) => s.startTime && s.startTime > agora).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[#00A859] text-sm hover:underline">← Voltar ao evento</Link>
          <LogoutButton />
        </div>

        {/* Card do participante */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: "#00A859" }}>
              {participante.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{participante.name}</h1>
              <p className="text-sm text-gray-500">{participante.email}</p>
              <span className="inline-block mt-1 bg-green-50 text-[#00A859] text-xs font-medium px-2 py-0.5 rounded-full border border-green-100">
                {participante.category.name}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 text-sm text-gray-500 space-y-1">
            <p><span className="font-medium text-gray-700">Evento:</span> {participante.event.name}</p>
            {participante.phone && <p><span className="font-medium text-gray-700">Telefone:</span> {participante.phone}</p>}
            {participante.document && <p><span className="font-medium text-gray-700">CPF:</span> {participante.document}</p>}
          </div>
        </div>

        {/* Pontuação da feira */}
        {(meusPontos > 0 || participante.visitas.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">🏆 Feira de Negócios</h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-[#00A859]">{meusPontos}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pontos</p>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-[#00A859]">{participante.visitas.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Estandes</p>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-[#00A859]">{minhaPos > 0 ? `#${minhaPos}` : "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Posição</p>
              </div>
            </div>

            {participante.visitas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Estandes visitados</p>
                <div className="space-y-1.5">
                  {participante.visitas.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 flex items-center gap-1.5"><span className="text-[#00A859]">✓</span>{v.expositor.nome}</span>
                      <span className="text-xs font-medium text-[#00A859]">+{v.expositor.pontos} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">🏅 Conquistas</h2>
          <p className="text-xs text-gray-400 mb-4">{badges.filter(b => b.conquistado).length} de {badges.length} desbloqueadas</p>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b.id} className={`flex flex-col items-center text-center gap-1 p-3 rounded-2xl border-2 transition-all ${b.conquistado ? "border-yellow-300 bg-yellow-50" : "border-gray-100 bg-gray-50 opacity-40 grayscale"}`}>
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-[10px] font-bold text-gray-700 leading-tight">{b.titulo}</span>
                {b.conquistado && <span className="text-[9px] text-yellow-600 font-medium">✓ Conquistado</span>}
              </div>
            ))}
          </div>
          {badges.filter(b => b.conquistado).length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">Visite estandes, avalie sessões e faça perguntas para desbloquear!</p>
          )}
        </div>

        {/* Identificação facial */}
        <Link href="/participante/facial"
          className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00A85915] flex items-center justify-center text-2xl shrink-0">🪪</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Identificação Facial</p>
              <p className="text-sm text-gray-500">Cadastre seu rosto para credenciamento rápido</p>
            </div>
            <span className="text-gray-300">→</span>
          </div>
        </Link>

        {/* Leitor QR da feira */}
        <LeitorQrFeira />

        {/* Ranking */}
        {ranking.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">🏅 Ranking — Feira de Negócios</h2>
            <div className="space-y-2">
              {ranking.map((r, i) => (
                <div key={r.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.id === participanteId ? "bg-green-50 border border-green-100" : ""}`}>
                  <span className={`text-sm font-bold w-6 text-center ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}
                  </span>
                  <span className={`flex-1 text-sm ${r.id === participanteId ? "font-semibold text-[#00A859]" : "text-gray-700"}`}>
                    {r.nome}{r.id === participanteId ? " (você)" : ""}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{r.total} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ao vivo agora */}
        {aoVivo.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                <div className="mt-3 flex items-center gap-2 text-[#00A859] text-sm font-medium">
                  <span>Participar → perguntas, enquetes e avaliação</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Próximas sessões */}
        {proximas.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Próximas sessões</h2>
            {proximas.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex gap-4 items-start">
                <div className="text-center min-w-[48px]">
                  <p className="text-sm font-bold text-[#00A859]">
                    {s.startTime ? new Date(s.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                  {s.speakers.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{s.speakers.map((sp) => sp.name).join(", ")}</p>}
                  {s.location && <p className="text-xs text-gray-400 mt-0.5">📍 {s.location}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="font-semibold text-gray-900 mb-4">Seu QR Code de acesso</h2>
          <img src={`/api/qrcode?codigo=${participante.qrCode}`} alt="QR Code" className="mx-auto w-52 h-52" />
          <p className="text-xs text-gray-400 mt-3">Apresente na entrada do evento para o credenciamento</p>
        </div>

        {/* Histórico de presença */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Histórico de presença</h2>
          {participante.checkins.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum check-in registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {participante.checkins.map((c) => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="text-[#00A859]">✓</span>
                  <span className="text-gray-700">{c.session?.title ?? "Entrada geral"}</span>
                  <span className="text-gray-400 ml-auto">{new Date(c.checkedInAt).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
