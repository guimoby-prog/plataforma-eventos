import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import FormSessao from "../FormSessao";

export default async function EditarSessao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sessao, eventos, palestrantes] = await Promise.all([
    prisma.session.findUnique({ where: { id }, include: { speakers: true } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.speaker.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!sessao) notFound();
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Sessão</h1>
      <p className="text-gray-500 text-sm mb-8">Atualize os dados da sessão.</p>
      <FormSessao sessao={sessao} eventos={eventos} palestrantes={palestrantes} />
    </div>
  );
}
