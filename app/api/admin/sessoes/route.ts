import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { title, description, startTime, endTime, location, track, day, eventId, speakerIds } = await req.json();

    if (!title || !startTime || !endTime || !eventId) {
      return NextResponse.json({ erro: "Título, horários e evento são obrigatórios." }, { status: 400 });
    }

    const sessao = await prisma.session.create({
      data: {
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || null,
        track: track || null,
        day: day || null,
        eventId,
        speakers: speakerIds?.length ? { connect: speakerIds.map((id: string) => ({ id })) } : undefined,
      },
    });

    return NextResponse.json(sessao);
  } catch {
    return NextResponse.json({ erro: "Erro ao criar sessão." }, { status: 500 });
  }
}
