import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/visita  { qrCode: string }
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const participantId = cookieStore.get("participante_id")?.value;
    if (!participantId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { qrCode } = await req.json();
    const expositor = await prisma.expositor.findUnique({ where: { qrCode } });
    if (!expositor) return NextResponse.json({ error: "QR Code inválido" }, { status: 404 });

    // Tenta registrar visita — ignora se já visitou (unique constraint)
    try {
      await prisma.visitaExpositor.create({
        data: { expositorId: expositor.id, participantId },
      });
      return NextResponse.json({ ok: true, novo: true, pontos: expositor.pontos, nome: expositor.nome });
    } catch {
      return NextResponse.json({ ok: true, novo: false, pontos: 0, nome: expositor.nome });
    }
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
