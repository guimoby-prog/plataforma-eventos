import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, description, startTime, endTime, location, track, day, eventId, speakerIds } = await req.json();

    if (!title || !startTime || !endTime || !eventId) {
      return NextResponse.json({ erro: "Título, horários e evento são obrigatórios." }, { status: 400 });
    }

    const sessao = await prisma.session.update({
      where: { id },
      data: {
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || null,
        track: track || null,
        day: day || null,
        eventId,
        speakers: {
          set: speakerIds?.length ? speakerIds.map((sid: string) => ({ id: sid })) : [],
        },
      },
    });

    return NextResponse.json(sessao);
  } catch {
    return NextResponse.json({ erro: "Erro ao atualizar sessão." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.session.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ erro: "Erro ao excluir sessão." }, { status: 500 });
  }
}
