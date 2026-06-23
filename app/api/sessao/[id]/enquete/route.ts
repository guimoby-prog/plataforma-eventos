import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const participanteId = cookieStore.get("participante_id")?.value;

  const enquete = await prisma.enquete.findFirst({
    where: { sessionId: id, ativa: true },
    include: {
      opcoes: {
        orderBy: { ordem: "asc" },
        include: { _count: { select: { respostas: true } } },
      },
      respostas: participanteId ? { where: { participantId: participanteId } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!enquete) return NextResponse.json(null);

  const totalVotos = enquete.opcoes.reduce((acc, o) => acc + o._count.respostas, 0);
  const meuVoto = participanteId ? enquete.respostas?.[0]?.opcaoId ?? null : null;

  return NextResponse.json({
    id: enquete.id,
    pergunta: enquete.pergunta,
    totalVotos,
    meuVoto,
    opcoes: enquete.opcoes.map((o) => ({
      id: o.id,
      texto: o.texto,
      votos: o._count.respostas,
      pct: totalVotos > 0 ? Math.round((o._count.respostas / totalVotos) * 100) : 0,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { enqueteId, opcaoId } = await req.json();
  const cookieStore = await cookies();
  const participanteId = cookieStore.get("participante_id")?.value;
  if (!participanteId) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const jaVotou = await prisma.respostaEnquete.findUnique({
    where: { enqueteId_participantId: { enqueteId, participantId: participanteId } },
  });
  if (jaVotou) return NextResponse.json({ erro: "Já votou" }, { status: 409 });

  await prisma.respostaEnquete.create({
    data: { enqueteId, opcaoId, participantId: participanteId },
  });
  return NextResponse.json({ ok: true });
}
