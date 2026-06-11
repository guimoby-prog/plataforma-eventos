import { prisma } from "@/lib/db";
import FormSessao from "../FormSessao";

export default async function NovaSessao() {
  const [eventos, palestrantes] = await Promise.all([
    prisma.event.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.speaker.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Sessão</h1>
      <p className="text-gray-500 text-sm mb-8">Preencha os dados da sessão da programação.</p>
      <FormSessao eventos={eventos} palestrantes={palestrantes} />
    </div>
  );
}
