"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAPEIS_PALESTRANTE } from "@/lib/constants";
import UploadImagem from "@/components/UploadImagem";

type Evento = { id: string; name: string };
type Palestrante = {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  role: string;
  eventId: string;
};

export default function FormPalestrante({ palestrante, eventos }: { palestrante?: Palestrante; eventos: Evento[] }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    name: palestrante?.name ?? "",
    bio: palestrante?.bio ?? "",
    photoUrl: palestrante?.photoUrl ?? "",
    role: palestrante?.role ?? "Palestrante",
    eventId: palestrante?.eventId ?? eventos[0]?.id ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const res = await fetch(
        palestrante ? `/api/admin/palestrantes/${palestrante.id}` : "/api/admin/palestrantes",
        {
          method: palestrante ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao salvar.");
      }
      router.push("/admin/palestrantes");
      router.refresh();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!confirm("Tem certeza que deseja excluir este palestrante?")) return;
    await fetch(`/api/admin/palestrantes/${palestrante!.id}`, { method: "DELETE" });
    router.push("/admin/palestrantes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo <span className="text-red-500">*</span></label>
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Ex: Dr. Carlos Mendes"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Papel <span className="text-red-500">*</span></label>
          <select name="role" value={form.role} onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {PAPEIS_PALESTRANTE.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Evento <span className="text-red-500">*</span></label>
          <select name="eventId" value={form.eventId} onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {eventos.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mini currículo / Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
          placeholder="Descreva a trajetória e especialidades do palestrante..."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <UploadImagem label="Foto do palestrante" valor={form.photoUrl} onChange={(url) => setForm((p) => ({ ...p, photoUrl: url }))} pasta="palestrantes" formato="quadrado" />

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button type="submit" disabled={salvando}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
            {salvando ? "Salvando..." : palestrante ? "Salvar alterações" : "Cadastrar palestrante"}
          </button>
          <button type="button" onClick={() => router.push("/admin/palestrantes")}
            className="text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
            Cancelar
          </button>
        </div>
        {palestrante && (
          <button type="button" onClick={handleExcluir}
            className="text-red-500 text-sm hover:underline">
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
