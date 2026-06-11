import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import FormPalestrante from "../FormPalestrante";

export default async function EditarPalestrante({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [palestrante, eventos] = await Promise.all([
    prisma.speaker.findUnique({ where: { id } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (!palestrante) notFound();
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Palestrante</h1>
      <p className="text-gray-500 text-sm mb-8">Atualize os dados do palestrante.</p>
      <FormPalestrante palestrante={palestrante} eventos={eventos} />
    </div>
  );
}
