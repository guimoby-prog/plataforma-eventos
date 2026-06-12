import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { primaryColor, secondaryColor, fontFamily, heroTitle, heroSubtitle, footerText, logoUrl, bannerUrl } = await req.json();

    const evento = await prisma.event.update({
      where: { id },
      data: { primaryColor, secondaryColor, fontFamily, heroTitle, heroSubtitle, footerText, logoUrl, bannerUrl },
    });

    return NextResponse.json({ sucesso: true, evento });
  } catch {
    return NextResponse.json({ erro: "Erro ao salvar." }, { status: 500 });
  }
}
