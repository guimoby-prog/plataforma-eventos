import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function GET() {
  const expositores = await prisma.expositor.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { visitas: true } }, event: { select: { name: true } } },
  });
  return NextResponse.json(expositores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const senha = await bcrypt.hash(body.senha, 10);
  const expositor = await prisma.expositor.create({
    data: {
      eventId: body.eventId,
      nome: body.nome,
      email: body.email,
      senha,
      qrCode: randomUUID(),
      pontos: Number(body.pontos) || 10,
      descricao: body.descricao ?? null,
    },
  });
  return NextResponse.json(expositor, { status: 201 });
}
