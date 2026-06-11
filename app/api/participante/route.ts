import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ erro: "E-mail não informado." }, { status: 400 });
  }

  const evento = await prisma.event.findFirst({ where: { isPublished: true } });
  if (!evento) {
    return NextResponse.json({ erro: "Nenhum evento ativo." }, { status: 404 });
  }

  const participante = await prisma.participant.findUnique({
    where: { eventId_email: { eventId: evento.id, email } },
    include: { category: true },
  });

  if (!participante) {
    return NextResponse.json({ erro: "Inscrição não encontrada para este e-mail." }, { status: 404 });
  }

  return NextResponse.json(participante);
}
