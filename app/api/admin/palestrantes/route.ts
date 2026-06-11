import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, bio, photoUrl, role, eventId } = await req.json();
    if (!name || !eventId) {
      return NextResponse.json({ erro: "Nome e evento são obrigatórios." }, { status: 400 });
    }
    const palestrante = await prisma.speaker.create({
      data: { name, bio: bio || null, photoUrl: photoUrl || null, role, eventId },
    });
    return NextResponse.json(palestrante);
  } catch {
    return NextResponse.json({ erro: "Erro ao cadastrar palestrante." }, { status: 500 });
  }
}
