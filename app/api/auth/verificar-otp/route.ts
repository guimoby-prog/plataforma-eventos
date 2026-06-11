import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarOtp } from "@/lib/otp";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, codigo } = await req.json();

  if (!email || !codigo) {
    return NextResponse.json({ erro: "E-mail e código são obrigatórios." }, { status: 400 });
  }

  const valido = await verificarOtp(email, codigo);
  if (!valido) {
    return NextResponse.json({ erro: "Código inválido ou expirado." }, { status: 401 });
  }

  const evento = await prisma.event.findFirst({ where: { isPublished: true } });
  const participante = await prisma.participant.findUnique({
    where: { eventId_email: { eventId: evento!.id, email } },
    include: { category: true },
  });

  // Salva sessão em cookie seguro
  const cookieStore = await cookies();
  cookieStore.set("participante_id", participante!.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });

  return NextResponse.json({ sucesso: true });
}
