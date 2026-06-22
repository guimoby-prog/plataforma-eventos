import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const secoes = await prisma.secao.findMany({
    where: { eventId: id },
    orderBy: { ordem: "asc" },
  });
  return NextResponse.json(secoes);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const ultima = await prisma.secao.findFirst({
    where: { eventId: id },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  const secao = await prisma.secao.create({
    data: {
      eventId: id,
      tipo: body.tipo,
      titulo: body.titulo ?? null,
      conteudo: body.conteudo ?? "{}",
      ordem: (ultima?.ordem ?? -1) + 1,
      bgColor: body.bgColor ?? "#ffffff",
      textColor: body.textColor ?? "#111827",
      padding: body.padding ?? "py-16",
      align: body.align ?? "center",
    },
  });
  return NextResponse.json(secao, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json(); // [{ id, ordem }]
  await Promise.all(
    body.map((item: { id: string; ordem: number }) =>
      prisma.secao.update({ where: { id: item.id }, data: { ordem: item.ordem } })
    )
  );
  const secoes = await prisma.secao.findMany({ where: { eventId: id }, orderBy: { ordem: "asc" } });
  return NextResponse.json(secoes);
}
