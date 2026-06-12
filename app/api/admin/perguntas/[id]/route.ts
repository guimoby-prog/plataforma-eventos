import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { aprovada, respondida } = await req.json();
    const pergunta = await prisma.pergunta.update({
      where: { id },
      data: { ...(aprovada !== undefined && { aprovada }), ...(respondida !== undefined && { respondida }) },
    });
    return NextResponse.json(pergunta);
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.pergunta.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
