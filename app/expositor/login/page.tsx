"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginExpositor() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const res = await fetch("/api/expositor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setErro(data.error); setLoading(false); return; }
    router.push("/expositor/area");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl" style={{ background: "#00A85915" }}>
            🤝
          </div>
          <h1 className="text-xl font-bold text-gray-900">Portal do Expositor</h1>
          <p className="text-sm text-gray-500 mt-1">Acesse para ver seus visitantes</p>
        </div>

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">E-mail</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="seu@email.com" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Senha</label>
            <input type="password" value={form.senha}
              onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
              placeholder="••••••••" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
          </div>
          {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#00A859] text-white font-semibold py-3 rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
