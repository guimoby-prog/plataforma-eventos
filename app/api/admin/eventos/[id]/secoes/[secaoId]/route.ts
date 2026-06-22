import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; secaoId: string }> }) {
  const { secaoId } = await params;
  const body = await req.json();
  const secao = await prisma.secao.update({
    where: { id: secaoId },
    data: {
      titulo: body.titulo,
      conteudo: body.conteudo,
      visivel: body.visivel,
      bgColor: body.bgColor,
      textColor: body.textColor,
      padding: body.padding,
      align: body.align,
    },
  });
  return NextResponse.json(secao);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; secaoId: string }> }) {
  const { secaoId } = await params;
  await prisma.secao.delete({ where: { id: secaoId } });
  return NextResponse.json({ ok: true });
}
