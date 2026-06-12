import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      async function enviar() {
        try {
          const [perguntas, enquete] = await Promise.all([
            prisma.pergunta.findMany({
              where: { sessionId: id, aprovada: true },
              include: { participant: { select: { name: true } } },
              orderBy: { createdAt: "asc" },
            }),
            prisma.enquete.findFirst({
              where: { sessionId: id, ativa: true },
              include: {
                opcoes: { orderBy: { ordem: "asc" } },
                respostas: { select: { opcaoId: true } },
              },
              orderBy: { createdAt: "desc" },
            }),
          ]);

          const payload = JSON.stringify({ perguntas, enquete });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          controller.close();
        }
      }

      enviar();
      interval = setInterval(enviar, 3000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
