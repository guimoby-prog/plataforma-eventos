import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

async function autenticado() {
  const c = await cookies();
  return !!c.get("admin_session")?.value;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await autenticado())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const evento = await prisma.event.update({
    where: { id },
    data: { webappConfig: JSON.stringify(body) },
  });
  return NextResponse.json({ ok: true, webappConfig: evento.webappConfig });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({ where: { id }, select: { webappConfig: true, primaryColor: true, secondaryColor: true, logoUrl: true } });
  if (!evento) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  let config = {};
  try { config = JSON.parse(evento.webappConfig ?? "{}"); } catch { /* */ }
  return NextResponse.json({ config, primaryColor: evento.primaryColor, secondaryColor: evento.secondaryColor, logoUrl: evento.logoUrl });
}
