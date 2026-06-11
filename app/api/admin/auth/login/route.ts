import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { usuario, senha } = await req.json();

    if (
      usuario !== process.env.ADMIN_USER ||
      senha !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session", process.env.ADMIN_SESSION_SECRET!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    });

    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
