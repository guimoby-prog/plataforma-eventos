import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PainelModeracao from "./PainelModeracao";

export default async function ModeracaoSessao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await prisma.session.findUnique({
    where: { id },
    include: {
      speakers: true,
      perguntas: { include: { participant: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      enquetes: { include: { opcoes: { orderBy: { ordem: "asc" } }, respostas: true }, orderBy: { createdAt: "desc" }, take: 1 },
      avaliacoes: { select: { nota: true, comentario: true } },
    },
  });
  if (!sessao) notFound();
  return <PainelModeracao sessao={sessao} />;
}
