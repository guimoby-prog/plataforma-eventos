import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get("participante_id")?.value;
    if (!participantId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { faceDescriptor, fotoFace } = await req.json();
    await prisma.participant.update({
      where: { id: participantId },
      data: { faceDescriptor: JSON.stringify(faceDescriptor), fotoFace },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
