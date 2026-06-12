import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const participanteId = cookieStore.get("participante_id")?.value;
    if (!participanteId) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

    const { nota, comentario } = await req.json();
    if (!nota || nota < 1 || nota > 5) return NextResponse.json({ erro: "Nota inválida." }, { status: 400 });

    const avaliacao = await prisma.avaliacao.upsert({
      where: { sessionId_participantId: { sessionId: id, participantId: participanteId } },
      update: { nota, comentario },
      create: { sessionId: id, participantId: participanteId, nota, comentario },
    });

    return NextResponse.json(avaliacao);
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
