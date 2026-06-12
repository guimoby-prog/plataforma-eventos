import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import SessaoAoVivo from "./SessaoAoVivo";

export default async function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const participanteId = cookieStore.get("participante_id")?.value;
  if (!participanteId) redirect("/login");

  const [sessao, participante] = await Promise.all([
    prisma.session.findUnique({
      where: { id },
      include: { speakers: true, event: true },
    }),
    prisma.participant.findUnique({ where: { id: participanteId } }),
  ]);

  if (!sessao || !participante) notFound();

  const avaliacaoExistente = await prisma.avaliacao.findUnique({
    where: { sessionId_participantId: { sessionId: id, participantId: participanteId } },
  });

  return (
    <SessaoAoVivo
      sessao={sessao}
      participante={participante}
      avaliacaoExistente={avaliacaoExistente}
    />
  );
}
