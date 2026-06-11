"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"login" | "otp">("login");
  const [form, setForm] = useState({ email: "", senha: "", otp: "" });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeParticipante, setNomeParticipante] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, senha: form.senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setNomeParticipante(data.nome);
      setEtapa("otp");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/verificar-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, codigo: form.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      router.push("/participante/area");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  async function reenviarCodigo() {
    setErro("");
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, senha: form.senha }),
    });
    setErro("Novo código enviado para seu e-mail!");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Área do Participante</h1>
          <p className="text-gray-500 mt-2">
            {etapa === "login" ? "Acesse com seu e-mail e senha." : `Enviamos um código para ${form.email}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {etapa === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="seu@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input name="senha" type="password" value={form.senha} onChange={handleChange} required
                  placeholder="Sua senha"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}
              <button type="submit" disabled={carregando}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                {carregando ? "Verificando..." : "Entrar"}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Não tem conta?{" "}
                <Link href="/inscricao" className="text-blue-600 hover:underline">Faça sua inscrição</Link>
              </p>
            </form>
          )}

          {etapa === "otp" && (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">✉️</div>
                <p className="text-sm text-gray-600">Olá, <strong>{nomeParticipante}</strong>! Digite o código de 6 dígitos enviado para seu e-mail.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de verificação</label>
                <input name="otp" value={form.otp} onChange={handleChange} required
                  maxLength={6} placeholder="000000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {erro && (
                <div className={`text-sm rounded-lg px-4 py-3 ${erro.includes("enviado") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                  {erro}
                </div>
              )}
              <button type="submit" disabled={carregando}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                {carregando ? "Verificando..." : "Confirmar código"}
              </button>
              <div className="text-center space-y-2">
                <button type="button" onClick={reenviarCodigo} className="text-sm text-blue-600 hover:underline">
                  Reenviar código
                </button>
                <br />
                <button type="button" onClick={() => setEtapa("login")} className="text-sm text-gray-400 hover:underline">
                  ← Voltar
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:underline">← Voltar ao evento</Link>
        </p>
      </div>
    </div>
  );
}
