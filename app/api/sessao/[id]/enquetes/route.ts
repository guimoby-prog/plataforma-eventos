import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquetes = await prisma.enquete.findMany({
    where: { sessionId: id, ativa: true },
    include: {
      opcoes: { orderBy: { ordem: "asc" } },
      respostas: { select: { opcaoId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  return NextResponse.json(enquetes[0] ?? null);
}
