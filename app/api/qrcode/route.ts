import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get("codigo");
  if (!codigo) {
    return NextResponse.json({ erro: "Código não informado." }, { status: 400 });
  }

  const buffer = await QRCode.toBuffer(codigo, {
    width: 400,
    margin: 2,
    color: { dark: "#1d4ed8", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
}
