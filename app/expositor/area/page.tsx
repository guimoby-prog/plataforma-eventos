import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PainelExpositor from "./PainelExpositor";

export default async function AreaExpositor() {
  const cookieStore = await cookies();
  const expositorId = cookieStore.get("expositor_session")?.value;
  if (!expositorId) redirect("/expositor/login");

  const expositor = await prisma.expositor.findUnique({
    where: { id: expositorId },
    include: {
      visitas: {
        include: { participant: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!expositor) redirect("/expositor/login");

  return <PainelExpositor expositor={expositor} />;
}
