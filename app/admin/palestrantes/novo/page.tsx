import { prisma } from "@/lib/db";
import FormPalestrante from "../FormPalestrante";

export default async function NovoPalestrante() {
  const eventos = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Palestrante</h1>
      <p className="text-gray-500 text-sm mb-8">Preencha os dados do palestrante.</p>
      <FormPalestrante eventos={eventos} />
    </div>
  );
}
