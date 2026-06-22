"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";

type Expositor = {
  id: string;
  nome: string;
  email: string;
  pontos: number;
  descricao: string | null;
  qrCode: string;
  event: { name: string };
  _count: { visitas: number };
};

type Evento = { id: string; name: string };

const FORM_VAZIO = { eventId: "", nome: "", email: "", senha: "", pontos: "10", descricao: "" };

export default function GerenciadorExpositores({ expositores: inicial, eventos }: { expositores: Expositor[]; eventos: Evento[] }) {
  const [expositores, setExpositores] = useState(inicial);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [qrModal, setQrModal] = useState<{ nome: string; url: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function abrirQr(expositor: Expositor) {
    const url = `${window.location.origin}/participante/area?scan=1&qr=${expositor.qrCode}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: "#111827", light: "#ffffff" } });
    setQrModal({ nome: expositor.nome, url: dataUrl });
  }

  function baixarQr() {
    if (!qrModal) return;
    const a = document.createElement("a");
    a.href = qrModal.url;
    a.download = `qrcode-${qrModal.nome.toLowerCase().replace(/\s/g, "-")}.png`;
    a.click();
  }

  async function salvar() {
    if (!form.nome || !form.email || (!editando && !form.senha) || !form.eventId) return;
    setSalvando(true);
    if (editando) {
      const res = await fetch(`/api/admin/expositores/${editando}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const atualizado = await res.json();
      setExpositores((prev) => prev.map((e) => e.id === editando ? { ...e, ...atualizado } : e));
    } else {
      const res = await fetch("/api/admin/expositores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const novo = await res.json();
      // Busca com includes
      const lista = await fetch("/api/admin/expositores").then((r) => r.json());
      setExpositores(lista);
      void novo;
    }
    setForm(FORM_VAZIO);
    setEditando(null);
    setMostrarForm(false);
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este expositor?")) return;
    await fetch(`/api/admin/expositores/${id}`, { method: "DELETE" });
    setExpositores((prev) => prev.filter((e) => e.id !== id));
  }

  function iniciarEdicao(e: Expositor) {
    setForm({ eventId: "", nome: e.nome, email: e.email, senha: "", pontos: String(e.pontos), descricao: e.descricao ?? "" });
    setEditando(e.id);
    setMostrarForm(true);
  }

  return (
    <div className="p-8">
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expositores</h1>
          <p className="text-gray-500 text-sm mt-1">{expositores.length} expositor(es) cadastrado(s)</p>
        </div>
        <button onClick={() => { setMostrarForm(true); setEditando(null); setForm(FORM_VAZIO); }}
          className="bg-[#00A859] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008C45] transition-colors">
          + Novo expositor
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">{editando ? "Editar expositor" : "Novo expositor"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editando && (
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Evento</label>
                <select value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]">
                  <option value="">Selecione o evento</option>
                  {eventos.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome do estande</label>
              <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Empresa XYZ"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Pontos por visita</label>
              <input type="number" min="1" value={form.pontos} onChange={(e) => setForm((f) => ({ ...f, pontos: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">E-mail de acesso</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="contato@empresa.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Senha {editando && "(deixe em branco para manter)"}</label>
              <input type="password" value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição do estande (opcional)</label>
              <textarea value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                rows={2} placeholder="Apresentação do expositor..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setMostrarForm(false); setEditando(null); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button onClick={salvar} disabled={salvando}
              className="px-5 py-2 bg-[#00A859] text-white text-sm font-semibold rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50">
              {salvando ? "Salvando..." : editando ? "Salvar" : "Criar expositor"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {expositores.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
            Nenhum expositor cadastrado ainda.
          </div>
        )}
        {expositores.map((e) => (
          <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00A85915] flex items-center justify-center text-lg shrink-0">🤝</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-gray-900">{e.nome}</p>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{e.event.name}</span>
              </div>
              <p className="text-sm text-gray-400">{e.email} · <span className="font-medium text-[#00A859]">{e.pontos} pts/visita</span> · {e._count.visitas} visita(s)</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => abrirQr(e)}
                className="text-sm font-medium text-purple-600 hover:underline">QR Code</button>
              <button onClick={() => iniciarEdicao(e)}
                className="text-sm text-blue-600 hover:underline">Editar</button>
              <button onClick={() => excluir(e.id)}
                className="text-sm text-red-400 hover:text-red-600">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR Code */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-gray-900 text-lg mb-1">{qrModal.nome}</h2>
            <p className="text-sm text-gray-400 mb-5">Participantes escaneiam este QR Code para registrar visita</p>
            <img src={qrModal.url} alt="QR Code" className="mx-auto rounded-xl mb-5 w-52 h-52" />
            <div className="flex gap-3">
              <button onClick={() => setQrModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50">
                Fechar
              </button>
              <button onClick={baixarQr}
                className="flex-1 bg-[#00A859] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#008C45]">
                Baixar PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
