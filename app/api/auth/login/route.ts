import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json({ erro: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const evento = await prisma.event.findFirst({ where: { isPublished: true } });
    if (!evento) {
      return NextResponse.json({ erro: "Nenhum evento ativo." }, { status: 404 });
    }

    const participante = await prisma.participant.findUnique({
      where: { eventId_email: { eventId: evento.id, email } },
    });

    if (!participante || !participante.password) {
      return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const senhaCorreta = await bcrypt.compare(senha, participante.password);
    if (!senhaCorreta) {
      return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const response = NextResponse.json({ sucesso: true, nome: participante.name });
    response.cookies.set("participante_id", participante.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error("[login] erro:", err);
    return NextResponse.json({ erro: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
