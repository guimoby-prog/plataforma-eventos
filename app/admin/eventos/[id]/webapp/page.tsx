import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import WebappEditor from "./WebappEditor";

export default async function WebappPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({
    where: { id },
    select: { id: true, name: true, primaryColor: true, secondaryColor: true, logoUrl: true, webappConfig: true },
  });
  if (!evento) notFound();

  let config: Record<string, unknown> = {};
  try { config = JSON.parse(evento.webappConfig ?? "{}"); } catch { /* */ }

  return <WebappEditor evento={{ ...evento, config }} />;
}
