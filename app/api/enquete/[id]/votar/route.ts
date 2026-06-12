import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const participanteId = cookieStore.get("participante_id")?.value;
    if (!participanteId) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

    const { opcaoId } = await req.json();

    const resposta = await prisma.respostaEnquete.upsert({
      where: { enqueteId_participantId: { enqueteId: id, participantId: participanteId } },
      update: { opcaoId },
      create: { enqueteId: id, opcaoId, participantId: participanteId },
    });

    return NextResponse.json(resposta);
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
