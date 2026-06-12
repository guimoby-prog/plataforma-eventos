import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditorVisual from "./EditorVisual";

export default async function PageVisual({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({ where: { id } });
  if (!evento) notFound();
  return <EditorVisual evento={evento} />;
}
