import { prisma } from "@/lib/db";
import GerenciadorExpositores from "./GerenciadorExpositores";

export default async function ExpositoresAdmin() {
  const [expositores, eventos] = await Promise.all([
    prisma.expositor.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { visitas: true } }, event: { select: { name: true } } },
    }),
    prisma.event.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return <GerenciadorExpositores expositores={expositores} eventos={eventos} />;
}
