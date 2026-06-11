"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Evento = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  isPublished: boolean;
};

function toDatetimeLocal(date: Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function FormEvento({ evento }: { evento?: Evento }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    name: evento?.name ?? "",
    description: evento?.description ?? "",
    startDate: evento ? toDatetimeLocal(evento.startDate) : "",
    endDate: evento ? toDatetimeLocal(evento.endDate) : "",
    location: evento?.location ?? "",
    isPublished: evento?.isPublished ?? false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const res = await fetch(evento ? `/api/admin/eventos/${evento.id}` : "/api/admin/eventos", {
        method: evento ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao salvar.");
      }
      router.push("/admin/eventos");
      router.refresh();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do evento <span className="text-red-500">*</span></label>
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Ex: Congresso Anual 2026"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descreva o evento..."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de início <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de término <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
        <input name="location" value={form.location} onChange={handleChange} placeholder="Ex: Centro de Convenções — São Paulo, SP"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
        <span className="text-sm text-gray-700">Publicar evento (aparece no hotsite e aceita inscrições)</span>
      </label>

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={salvando}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
          {salvando ? "Salvando..." : evento ? "Salvar alterações" : "Criar evento"}
        </button>
        <button type="button" onClick={() => router.push("/admin/eventos")}
          className="text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
