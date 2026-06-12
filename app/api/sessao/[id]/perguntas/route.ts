import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perguntas = await prisma.pergunta.findMany({
    where: { sessionId: id, aprovada: true },
    include: { participant: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(perguntas);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const participanteId = cookieStore.get("participante_id")?.value;
    if (!participanteId) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

    const { texto } = await req.json();
    if (!texto?.trim()) return NextResponse.json({ erro: "Pergunta vazia." }, { status: 400 });

    const pergunta = await prisma.pergunta.create({
      data: { sessionId: id, participantId: participanteId, texto: texto.trim() },
    });
    return NextResponse.json(pergunta);
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
