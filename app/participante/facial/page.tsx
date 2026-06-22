import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CadastroFacial from "./CadastroFacial";

export default async function FacialPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participante_id")?.value;
  if (!participantId) redirect("/login");

  const participante = await prisma.participant.findUnique({
    where: { id: participantId },
    select: { name: true, fotoFace: true, faceDescriptor: true },
  });
  if (!participante) redirect("/login");

  return <CadastroFacial nome={participante.name} jaTemFace={!!participante.faceDescriptor} fotoAtual={participante.fotoFace} />;
}
