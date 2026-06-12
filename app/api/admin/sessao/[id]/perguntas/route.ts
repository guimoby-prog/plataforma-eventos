import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perguntas = await prisma.pergunta.findMany({
    where: { sessionId: id },
    include: { participant: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(perguntas);
}
