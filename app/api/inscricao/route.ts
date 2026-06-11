import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { nome, email, telefone, cpf, categoria } = await req.json();

    if (!nome || !email || !telefone || !cpf || !categoria) {
      return NextResponse.json({ erro: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    // Busca o evento ativo (primeiro publicado)
    const evento = await prisma.event.findFirst({ where: { isPublished: true } });
    if (!evento) {
      return NextResponse.json({ erro: "Nenhum evento disponível para inscrição." }, { status: 404 });
    }

    // Busca ou cria a categoria
    let cat = await prisma.category.findFirst({ where: { name: categoria } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name: categoria } });
    }

    // Verifica se já está inscrito
    const existente = await prisma.participant.findUnique({
      where: { eventId_email: { eventId: evento.id, email } },
    });
    if (existente) {
      return NextResponse.json({ erro: "Este e-mail já está inscrito neste evento." }, { status: 409 });
    }

    // Cria a inscrição
    const participante = await prisma.participant.create({
      data: {
        eventId: evento.id,
        categoryId: cat.id,
        name: nome,
        email,
        phone: telefone,
        document: cpf,
        lgpdAccepted: true,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({ sucesso: true, id: participante.id, qrCode: participante.qrCode });
  } catch {
    return NextResponse.json({ erro: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
