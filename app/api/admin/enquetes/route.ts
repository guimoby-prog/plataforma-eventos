import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, pergunta, opcoes } = await req.json();
    if (!sessionId || !pergunta || !opcoes?.length) {
      return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
    }

    // Desativa enquetes anteriores da sessão
    await prisma.enquete.updateMany({ where: { sessionId, ativa: true }, data: { ativa: false } });

    const enquete = await prisma.enquete.create({
      data: {
        sessionId,
        pergunta,
        opcoes: {
          create: opcoes.map((texto: string, ordem: number) => ({ texto, ordem })),
        },
      },
      include: { opcoes: true },
    });

    return NextResponse.json(enquete);
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
