import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function AreaParticipante() {
  const cookieStore = await cookies();
  const participanteId = cookieStore.get("participante_id")?.value;

  if (!participanteId) redirect("/login");

  const participante = await prisma.participant.findUnique({
    where: { id: participanteId },
    include: { category: true, event: true, checkins: { include: { session: true } } },
  });

  if (!participante) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao evento</Link>
          <LogoutButton />
        </div>

        {/* Card do participante */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {participante.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{participante.name}</h1>
              <p className="text-sm text-gray-500">{participante.email}</p>
              <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {participante.category.name}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 text-sm text-gray-500 space-y-1">
            <p><span className="font-medium text-gray-700">Evento:</span> {participante.event.name}</p>
            {participante.phone && <p><span className="font-medium text-gray-700">Telefone:</span> {participante.phone}</p>}
            {participante.document && <p><span className="font-medium text-gray-700">CPF:</span> {participante.document}</p>}
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="font-semibold text-gray-900 mb-4">Seu QR Code de acesso</h2>
          <img
            src={`/api/qrcode?codigo=${participante.qrCode}`}
            alt="QR Code de acesso"
            className="mx-auto w-52 h-52"
          />
          <p className="text-xs text-gray-400 mt-3">Apresente na entrada do evento para o credenciamento</p>
        </div>

        {/* Presença */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Histórico de presença</h2>
          {participante.checkins.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum check-in registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {participante.checkins.map((c) => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{c.session?.title ?? "Entrada geral"}</span>
                  <span className="text-gray-400 ml-auto">
                    {new Date(c.checkedInAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
