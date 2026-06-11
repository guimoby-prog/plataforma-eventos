import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, description, startDate, endDate, location, isPublished } = await req.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ erro: "Nome e datas são obrigatórios." }, { status: 400 });
    }

    const evento = await prisma.event.create({
      data: {
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        isPublished: isPublished ?? false,
      },
    });

    return NextResponse.json(evento);
  } catch {
    return NextResponse.json({ erro: "Erro ao criar evento." }, { status: 500 });
  }
}
