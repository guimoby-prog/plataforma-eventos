import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    const expositor = await prisma.expositor.findFirst({ where: { email } });
    if (!expositor) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    const ok = await bcrypt.compare(senha, expositor.senha);
    if (!ok) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

    const res = NextResponse.json({ ok: true, id: expositor.id, nome: expositor.nome });
    res.cookies.set("expositor_session", expositor.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 8 });
    return res;
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
