"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIAS_PARTICIPANTE } from "@/lib/constants";

type FormData = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  categoria: string;
  senha: string;
  confirmarSenha: string;
  lgpd: boolean;
  termos: boolean;
};

const INITIAL: FormData = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  categoria: "",
  senha: "",
  confirmarSenha: "",
  lgpd: false,
  termos: false,
};

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatTelefone(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{4})$/, "$1-$2");
}

export default function Inscricao() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleCPF(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, cpf: formatCPF(e.target.value) }));
  }

  function handleTelefone(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, telefone: formatTelefone(e.target.value) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (form.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (!form.lgpd || !form.termos) {
      setErro("Você precisa aceitar a Política de Privacidade e os Termos de Participação.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao realizar inscrição.");
      }

      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscrição realizada!</h1>
          <p className="text-gray-500 mb-6">Enviamos um e-mail de confirmação para <strong>{form.email}</strong>. Verifique sua caixa de entrada.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">← Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao evento</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Formulário de Inscrição</h1>
          <p className="text-gray-500 mt-1">Preencha os dados abaixo para garantir sua vaga.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo <span className="text-red-500">*</span></label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              placeholder="Seu nome completo"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail <span className="text-red-500">*</span></label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Telefone e CPF lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-red-500">*</span></label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleTelefone}
                required
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF <span className="text-red-500">*</span></label>
              <input
                name="cpf"
                value={form.cpf}
                onChange={handleCPF}
                required
                placeholder="000.000.000-00"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria <span className="text-red-500">*</span></label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione sua categoria</option>
              {CATEGORIAS_PARTICIPANTE.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Senha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha <span className="text-red-500">*</span></label>
              <input
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha <span className="text-red-500">*</span></label>
              <input
                name="confirmarSenha"
                type="password"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
                placeholder="Repita a senha"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* LGPD e Termos */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="lgpd"
                checked={form.lgpd}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600">
                Li e aceito a <span className="text-blue-600 underline cursor-pointer">Política de Privacidade</span> e o <span className="text-blue-600 underline cursor-pointer">Aviso de Privacidade (LGPD)</span>. <span className="text-red-500">*</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="termos"
                checked={form.termos}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600">
                Li e aceito os <span className="text-blue-600 underline cursor-pointer">Termos de Participação</span> e a <span className="text-blue-600 underline cursor-pointer">Política de Cancelamento</span>. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? "Enviando..." : "Confirmar inscrição"}
          </button>
        </form>
      </div>
    </div>
  );
}
