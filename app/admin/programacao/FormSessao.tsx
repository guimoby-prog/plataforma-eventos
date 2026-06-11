"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Evento = { id: string; name: string };
type Palestrante = { id: string; name: string; role: string };
type Sessao = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  location: string | null;
  track: string | null;
  day: string | null;
  eventId: string;
  speakers: Palestrante[];
};

function toDatetimeLocal(date: Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function FormSessao({
  sessao,
  eventos,
  palestrantes,
}: {
  sessao?: Sessao;
  eventos: Evento[];
  palestrantes: Palestrante[];
}) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    title: sessao?.title ?? "",
    description: sessao?.description ?? "",
    startTime: sessao ? toDatetimeLocal(sessao.startTime) : "",
    endTime: sessao ? toDatetimeLocal(sessao.endTime) : "",
    location: sessao?.location ?? "",
    track: sessao?.track ?? "",
    day: sessao?.day ?? "",
    eventId: sessao?.eventId ?? eventos[0]?.id ?? "",
    speakerIds: sessao?.speakers.map((s) => s.id) ?? [] as string[],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleSpeaker(id: string) {
    setForm((prev) => ({
      ...prev,
      speakerIds: prev.speakerIds.includes(id)
        ? prev.speakerIds.filter((s) => s !== id)
        : [...prev.speakerIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const res = await fetch(
        sessao ? `/api/admin/sessoes/${sessao.id}` : "/api/admin/sessoes",
        {
          method: sessao ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao salvar.");
      }
      router.push("/admin/programacao");
      router.refresh();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!confirm("Tem certeza que deseja excluir esta sessão?")) return;
    await fetch(`/api/admin/sessoes/${sessao!.id}`, { method: "DELETE" });
    router.push("/admin/programacao");
    router.refresh();
  }

  const palestraDoEvento = palestrantes.filter((p) => true);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-5">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título da sessão <span className="text-red-500">*</span></label>
        <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Abertura Oficial"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Evento <span className="text-red-500">*</span></label>
        <select name="eventId" value={form.eventId} onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {eventos.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Início <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Término <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dia (ex: 15/08)</label>
          <input name="day" value={form.day} onChange={handleChange} placeholder="15/08"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Local / Palco</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="Ex: Auditório A"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trilha / Tema</label>
          <input name="track" value={form.track} onChange={handleChange} placeholder="Ex: Tecnologia"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3}
          placeholder="Descreva o conteúdo da sessão..."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      {palestraDoEvento.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Palestrantes vinculados</label>
          <div className="space-y-2">
            {palestraDoEvento.map((p) => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.speakerIds.includes(p.id)}
                  onChange={() => toggleSpeaker(p.id)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{p.name}</span>
                <span className="text-xs text-blue-500">{p.role}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button type="submit" disabled={salvando}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
            {salvando ? "Salvando..." : sessao ? "Salvar alterações" : "Criar sessão"}
          </button>
          <button type="button" onClick={() => router.push("/admin/programacao")}
            className="text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
            Cancelar
          </button>
        </div>
        {sessao && (
          <button type="button" onClick={handleExcluir} className="text-red-500 text-sm hover:underline">
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
