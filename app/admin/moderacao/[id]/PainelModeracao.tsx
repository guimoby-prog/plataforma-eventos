"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Pergunta = { id: string; texto: string; aprovada: boolean; respondida: boolean; participant: { name: string }; createdAt: Date };
type OpcaoEnquete = { id: string; texto: string; ordem: number };
type Enquete = { id: string; pergunta: string; ativa: boolean; opcoes: OpcaoEnquete[]; respostas: { opcaoId: string; id: string; enqueteId: string; participantId: string; createdAt: Date }[] } | null;
type Avaliacao = { nota: number; comentario: string | null };
type Sessao = { id: string; title: string; speakers: { name: string; id: string; bio: string | null; photoUrl: string | null; role: string; eventId: string }[]; perguntas: Pergunta[]; enquetes: NonNullable<Enquete>[]; avaliacoes?: Avaliacao[] };

export default function PainelModeracao({ sessao: sessaoInicial }: { sessao: Sessao }) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>(sessaoInicial.perguntas);
  const [enquete, setEnquete] = useState<Enquete>(sessaoInicial.enquetes[0] ?? null);
  const [aba, setAba] = useState<"perguntas" | "enquete" | "avaliacoes">("perguntas");
  const avaliacoes = sessaoInicial.avaliacoes ?? [];
  const mediaAvaliacao = avaliacoes.length > 0 ? avaliacoes.reduce((a, v) => a + v.nota, 0) / avaliacoes.length : null;
  const [novaEnquete, setNovaEnquete] = useState({ pergunta: "", opcoes: ["", ""] });
  const [criandoEnquete, setCriandoEnquete] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/sessao/${sessaoInicial.id}/stream`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // Merge perguntas preservando as pendentes
      setPerguntas((prev) => {
        const ids = new Set(data.perguntas.map((p: Pergunta) => p.id));
        const pendentes = prev.filter((p) => !p.aprovada && !ids.has(p.id));
        return [...pendentes, ...data.perguntas];
      });
      if (data.enquete) setEnquete(data.enquete);
    };
    // Busca todas as perguntas (incluindo pendentes) a cada 3s
    const interval = setInterval(async () => {
      const res = await fetch(`/api/admin/sessao/${sessaoInicial.id}/perguntas`);
      if (res.ok) setPerguntas(await res.json());
    }, 3000);
    return () => { es.close(); clearInterval(interval); };
  }, [sessaoInicial.id]);

  async function aprovar(id: string) {
    await fetch(`/api/admin/perguntas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aprovada: true }) });
    setPerguntas((p) => p.map((q) => q.id === id ? { ...q, aprovada: true } : q));
  }

  async function marcarRespondida(id: string) {
    await fetch(`/api/admin/perguntas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ respondida: true }) });
    setPerguntas((p) => p.map((q) => q.id === id ? { ...q, respondida: true } : q));
  }

  async function excluir(id: string) {
    await fetch(`/api/admin/perguntas/${id}`, { method: "DELETE" });
    setPerguntas((p) => p.filter((q) => q.id !== id));
  }

  async function criarEnquete() {
    const opcoesFiltradas = novaEnquete.opcoes.filter((o) => o.trim());
    if (!novaEnquete.pergunta.trim() || opcoesFiltradas.length < 2) return;
    setCriandoEnquete(true);
    const res = await fetch("/api/admin/enquetes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessaoInicial.id, pergunta: novaEnquete.pergunta, opcoes: opcoesFiltradas }),
    });
    const data = await res.json();
    setEnquete(data);
    setNovaEnquete({ pergunta: "", opcoes: ["", ""] });
    setCriandoEnquete(false);
  }

  const pendentes = perguntas.filter((p) => !p.aprovada);
  const aprovadas = perguntas.filter((p) => p.aprovada && !p.respondida);
  const respondidas = perguntas.filter((p) => p.respondida);
  const totalVotos = enquete?.respostas.length ?? 0;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/moderacao" className="text-sm text-gray-400 hover:underline">← Moderação</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{sessaoInicial.title}</h1>
          {sessaoInicial.speakers.length > 0 && <p className="text-sm text-gray-500">{sessaoInicial.speakers.map(s => s.name).join(", ")}</p>}
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Atualiza automaticamente</span>
      </div>

      {/* Abas */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setAba("perguntas")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${aba === "perguntas" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
          💬 Perguntas {pendentes.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendentes.length}</span>}
        </button>
        <button onClick={() => setAba("enquete")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${aba === "enquete" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
          📊 Enquete
        </button>
        <button onClick={() => setAba("avaliacoes")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${aba === "avaliacoes" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
          ⭐ Avaliações {avaliacoes.length > 0 && `(${avaliacoes.length})`}
        </button>
      </div>

      {aba === "perguntas" && (
        <div className="space-y-6">
          {/* Pendentes */}
          {pendentes.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3">Aguardando aprovação ({pendentes.length})</h2>
              <div className="space-y-2">
                {pendentes.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-red-100 p-4 flex gap-4 items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{p.texto}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.participant.name}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => aprovar(p.id)} className="bg-[#00A859] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#008C45] font-medium">Aprovar</button>
                      <button onClick={() => excluir(p.id)} className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aprovadas */}
          {aprovadas.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#00A859] uppercase tracking-wide mb-3">Aprovadas — ao vivo ({aprovadas.length})</h2>
              <div className="space-y-2">
                {aprovadas.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-green-100 p-4 flex gap-4 items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{p.texto}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.participant.name}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => marcarRespondida(p.id)} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">Respondida</button>
                      <button onClick={() => excluir(p.id)} className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Respondidas */}
          {respondidas.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Respondidas ({respondidas.length})</h2>
              <div className="space-y-2">
                {respondidas.map((p) => (
                  <div key={p.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 opacity-60">
                    <p className="text-gray-700 text-sm">{p.texto}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.participant.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {perguntas.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Nenhuma pergunta recebida ainda.</p>
          )}
        </div>
      )}

      {aba === "enquete" && (
        <div className="space-y-6">
          {/* Enquete ativa */}
          {enquete && (
            <div className="bg-white rounded-2xl border border-[#00A859] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{enquete.pergunta}</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{totalVotos} votos</span>
              </div>
              <div className="space-y-3">
                {enquete.opcoes.map((opcao) => {
                  const votos = enquete.respostas.filter((r) => r.opcaoId === opcao.id).length;
                  const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
                  return (
                    <div key={opcao.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{opcao.texto}</span>
                        <span className="font-semibold text-gray-900">{pct}% ({votos})</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: "#00A859" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nova enquete */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{enquete ? "Nova enquete (substitui a atual)" : "Criar enquete"}</h2>
            <div className="space-y-3">
              <input value={novaEnquete.pergunta} onChange={(e) => setNovaEnquete((p) => ({ ...p, pergunta: e.target.value }))}
                placeholder="Qual é a pergunta da enquete?"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
              {novaEnquete.opcoes.map((opcao, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opcao} onChange={(e) => setNovaEnquete((p) => { const o = [...p.opcoes]; o[i] = e.target.value; return { ...p, opcoes: o }; })}
                    placeholder={`Opção ${i + 1}`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
                  {novaEnquete.opcoes.length > 2 && (
                    <button onClick={() => setNovaEnquete((p) => ({ ...p, opcoes: p.opcoes.filter((_, j) => j !== i) }))}
                      className="text-red-400 hover:text-red-600 px-2">✕</button>
                  )}
                </div>
              ))}
              {novaEnquete.opcoes.length < 5 && (
                <button onClick={() => setNovaEnquete((p) => ({ ...p, opcoes: [...p.opcoes, ""] }))}
                  className="text-sm text-[#00A859] hover:underline">+ Adicionar opção</button>
              )}
              <button onClick={criarEnquete} disabled={criandoEnquete}
                className="w-full bg-[#00A859] text-white font-semibold py-2.5 rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50 text-sm">
                {criandoEnquete ? "Lançando..." : "Lançar enquete ao vivo"}
              </button>
            </div>
          </div>
        </div>
      )}
      {aba === "avaliacoes" && (
        <div>
          {avaliacoes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">⭐</p>
              <p className="text-sm">Nenhuma avaliação recebida ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <p className="text-5xl font-black text-gray-900">{mediaAvaliacao?.toFixed(1)}</p>
                <p className="text-yellow-400 text-2xl mt-1">{"⭐".repeat(Math.round(mediaAvaliacao ?? 0))}</p>
                <p className="text-sm text-gray-400 mt-1">Média de {avaliacoes.length} avaliação(ões)</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map((nota) => {
                  const qtd = avaliacoes.filter((a) => a.nota === nota).length;
                  const pct = avaliacoes.length > 0 ? Math.round((qtd / avaliacoes.length) * 100) : 0;
                  return (
                    <div key={nota} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                      <p className="text-lg">{"⭐".repeat(nota)}</p>
                      <p className="font-bold text-gray-900 mt-1">{qtd}</p>
                      <p className="text-xs text-gray-400">{pct}%</p>
                    </div>
                  );
                })}
              </div>
              {avaliacoes.filter((a) => a.comentario).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Comentários</h3>
                  <div className="space-y-2">
                    {avaliacoes.filter((a) => a.comentario).map((a, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-yellow-400 text-sm mb-1">{"⭐".repeat(a.nota)}</p>
                        <p className="text-sm text-gray-700 italic">"{a.comentario}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
