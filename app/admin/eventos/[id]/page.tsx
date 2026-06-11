import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import FormEvento from "../FormEvento";

export default async function EditarEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({ where: { id } });
  if (!evento) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Evento</h1>
      <p className="text-gray-500 text-sm mb-8">Atualize as informações do evento.</p>
      <FormEvento evento={evento} />
    </div>
  );
}
