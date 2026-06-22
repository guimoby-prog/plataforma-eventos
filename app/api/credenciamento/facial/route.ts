import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const participantes = await prisma.participant.findMany({
    where: { faceDescriptor: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      faceDescriptor: true,
      fotoFace: true,
      category: { select: { name: true } },
    },
  });
  return NextResponse.json(participantes);
}
