import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { qrCode, sessionId } = await req.json();

  if (!qrCode) {
    return NextResponse.json({ status: "erro", mensagem: "QR Code não informado.", nome: "", categoria: "" }, { status: 400 });
  }

  const participante = await prisma.participant.findUnique({
    where: { qrCode },
    include: { category: true },
  });

  if (!participante) {
    return NextResponse.json({ status: "erro", mensagem: "Participante não encontrado.", nome: "", categoria: "" }, { status: 404 });
  }

  // Verifica se já fez check-in nesta sessão
  const checkinExistente = await prisma.checkin.findFirst({
    where: {
      participantId: participante.id,
      sessionId: sessionId ?? null,
    },
  });

  if (checkinExistente) {
    return NextResponse.json({
      status: "jaRegistrado",
      nome: participante.name,
      categoria: participante.category.name,
      mensagem: "Entrada já registrada anteriormente.",
    });
  }

  await prisma.checkin.create({
    data: {
      participantId: participante.id,
      sessionId: sessionId ?? null,
    },
  });

  return NextResponse.json({
    status: "sucesso",
    nome: participante.name,
    categoria: participante.category.name,
    mensagem: "Entrada registrada com sucesso!",
  });
}
