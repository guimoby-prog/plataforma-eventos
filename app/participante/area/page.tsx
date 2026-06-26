import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AreaParticipanteClient from "./AreaParticipanteClient";

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
      visitas: {
        include: { expositor: { select: { nome: true, pontos: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    // fotoFace e faceDescriptor já estão no modelo
  });

  if (!participante) redirect("/login");

  const agora = new Date();

  const sessoes = await prisma.session.findMany({
    where: { eventId: participante.eventId },
    include: { speakers: true },
    orderBy: { startTime: "asc" },
  });

  const todasVisitas = await prisma.visitaExpositor.findMany({
    where: { expositor: { eventId: participante.eventId } },
    include: {
      expositor: { select: { pontos: true } },
      participant: { select: { id: true, name: true } },
    },
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

  const totalExpositores = await prisma.expositor.count({ where: { eventId: participante.eventId } });
  const minhaAvaliacao = await prisma.avaliacao.findFirst({ where: { participantId: participanteId } });
  const minhaPergunta = await prisma.pergunta.findFirst({ where: { participantId: participanteId, aprovada: true } });

  const badges = [
    { id: "primeiro-estande", emoji: "🥇", titulo: "Pioneiro", descricao: "Visitou o primeiro estande", conquistado: participante.visitas.length >= 1 },
    { id: "tres-estandes", emoji: "🔥", titulo: "Em chamas", descricao: "Visitou 3 estandes", conquistado: participante.visitas.length >= 3 },
    { id: "cinco-estandes", emoji: "⚡", titulo: "Networker", descricao: "Visitou 5 estandes", conquistado: participante.visitas.length >= 5 },
    { id: "todos-estandes", emoji: "🎯", titulo: "Explorador", descricao: "Visitou todos os estandes", conquistado: totalExpositores > 0 && participante.visitas.length >= totalExpositores },
    { id: "avaliou-sessao", emoji: "⭐", titulo: "Crítico", descricao: "Avaliou uma sessão", conquistado: !!minhaAvaliacao },
    { id: "pergunta-aprovada", emoji: "💬", titulo: "Questionador", descricao: "Teve uma pergunta aprovada", conquistado: !!minhaPergunta },
    { id: "top3", emoji: "🏆", titulo: "Pódio", descricao: "Chegou ao top 3 do ranking", conquistado: minhaPos >= 1 && minhaPos <= 3 },
  ];

  const aoVivo = sessoes.filter(
    (s) => s.startTime && s.endTime && s.startTime <= agora && s.endTime >= agora
  );
  const proximas = sessoes.filter((s) => s.startTime && s.startTime > agora).slice(0, 5);

  // Serializar datas para JSON
  const sessoesSer = sessoes.map((s) => ({
    ...s,
    startTime: s.startTime?.toISOString() ?? null,
    endTime: s.endTime?.toISOString() ?? null,
    speakers: s.speakers.map((sp) => ({ name: sp.name })),
  }));

  const aoVivoSer = aoVivo.map((s) => ({
    ...s,
    startTime: s.startTime?.toISOString() ?? null,
    endTime: s.endTime?.toISOString() ?? null,
    speakers: s.speakers.map((sp) => ({ name: sp.name })),
  }));

  const proximasSer = proximas.map((s) => ({
    ...s,
    startTime: s.startTime?.toISOString() ?? null,
    endTime: s.endTime?.toISOString() ?? null,
    speakers: s.speakers.map((sp) => ({ name: sp.name })),
  }));

  const participanteSer = {
    id: participante.id,
    name: participante.name,
    email: participante.email,
    phone: participante.phone,
    document: participante.document,
    qrCode: participante.qrCode,
    fotoFace: participante.fotoFace ?? null,
    category: { name: participante.category.name },
    event: { name: participante.event.name },
    visitas: participante.visitas.map((v) => ({
      id: v.id,
      createdAt: v.createdAt.toISOString(),
      expositor: { nome: v.expositor.nome, pontos: v.expositor.pontos },
    })),
    checkins: participante.checkins.map((c) => ({
      id: c.id,
      checkedInAt: c.checkedInAt.toISOString(),
      session: c.session ? { title: c.session.title } : null,
    })),
  };

  return (
    <AreaParticipanteClient
      participante={participanteSer}
      sessoes={sessoesSer}
      ranking={ranking}
      meusPontos={meusPontos}
      minhaPos={minhaPos}
      badges={badges}
      aoVivo={aoVivoSer}
      proximas={proximasSer}
    />
  );
}
