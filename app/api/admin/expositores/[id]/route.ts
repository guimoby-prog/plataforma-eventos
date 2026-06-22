import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {
    nome: body.nome,
    email: body.email,
    pontos: Number(body.pontos),
    descricao: body.descricao ?? null,
  };
  if (body.senha) data.senha = await bcrypt.hash(body.senha, 10);
  const expositor = await prisma.expositor.update({ where: { id }, data });
  return NextResponse.json(expositor);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expositor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
