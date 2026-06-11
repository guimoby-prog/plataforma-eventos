import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, bio, photoUrl, role, eventId } = await req.json();
    if (!name || !eventId) {
      return NextResponse.json({ erro: "Nome e evento são obrigatórios." }, { status: 400 });
    }
    const palestrante = await prisma.speaker.update({
      where: { id },
      data: { name, bio: bio || null, photoUrl: photoUrl || null, role, eventId },
    });
    return NextResponse.json(palestrante);
  } catch {
    return NextResponse.json({ erro: "Erro ao atualizar palestrante." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.speaker.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ erro: "Erro ao excluir palestrante." }, { status: 500 });
  }
}
