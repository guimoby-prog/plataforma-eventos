import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PageBuilder from "./PageBuilder";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({ where: { id } });
  if (!evento) notFound();

  const secoes = await prisma.secao.findMany({
    where: { eventId: id },
    orderBy: { ordem: "asc" },
  });

  return (
    <PageBuilder
      eventoId={id}
      eventoNome={evento.name}
      primaryColor={evento.primaryColor}
      secondaryColor={evento.secondaryColor}
      fontFamily={evento.fontFamily}
      secoesIniciais={secoes.map((s) => ({
        id: s.id,
        tipo: s.tipo,
        titulo: s.titulo,
        conteudo: s.conteudo,
        ordem: s.ordem,
        visivel: s.visivel,
        bgColor: s.bgColor,
        textColor: s.textColor,
        padding: s.padding,
        align: s.align,
      }))}
    />
  );
}
