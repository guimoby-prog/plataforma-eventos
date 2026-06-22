import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ConstrutorSecoes from "./ConstrutorSecoes";

export default async function SecoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({ where: { id } });
  if (!evento) notFound();

  const secoes = await prisma.secao.findMany({
    where: { eventId: id },
    orderBy: { ordem: "asc" },
  });

  return <ConstrutorSecoes eventId={id} secoesIniciais={secoes} />;
}
