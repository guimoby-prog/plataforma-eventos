"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Speaker = { id: string; name: string; role: string };
type Sessao = { id: string; title: string; description: string | null; location: string | null; startTime: Date | null; speakers: Speaker[]; event: { name: string } };
type Participante = { id: string; name: string };
type Pergunta = { id: string; texto: string; respondida: boolean; participant: { name: string } };
type OpcaoEnquete = { id: string; texto: string; ordem: number };
type Enquete = { id: string; pergunta: string; opcoes: OpcaoEnquete[]; respostas: { opcaoId: string }[] };
type Avaliacao = { nota: number; comentario: string | null } | null;

export default function SessaoAoVivo({
  sessao, participante, avaliacaoExistente,
}: {
  sessao: Sessao;
  participante: Participante;
  avaliacaoExistente: Avaliacao;
}) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [enquete, setEnquete] = useState<Enquete | null>(null);
  const [textoPergunta, setTextoPergunta] = useState("");
  const [enviandoPergunta, setEnviandoPergunta] = useState(false);
  const [perguntaEnviada, setPerguntaEnviada] = useState(false);
  const [votou, setVotou] = useState<string | null>(null);
  const [avaliacao, setAvaliacao] = useState<Avaliacao>(avaliacaoExistente);
  const [notaTemp, setNotaTemp] = useState(0);
  const [comentario, setComentario] = useState("");
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [aba, setAba] = useState<"perguntas" | "enquete" | "avaliacao">("perguntas");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/sessao/${sessao.id}/stream`);
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setPerguntas(data.perguntas ?? []);
      setEnquete(data.enquete ?? null);
    };
    return () => es.close();
  }, [sessao.id]);

  async function enviarPergunta() {
    if (!textoPergunta.trim() || enviandoPergunta) return;
    setEnviandoPergunta(true);
    await fetch(`/api/sessao/${sessao.id}/perguntas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: textoPergunta }),
    });
    setTextoPergunta("");
    setPerguntaEnviada(true);
    setEnviandoPergunta(false);
    setTimeout(() => setPerguntaEnviada(false), 3000);
  }

  async function votar(opcaoId: string) {
    if (votou || !enquete) return;
    setVotou(opcaoId);
    await fetch(`/api/enquete/${enquete.id}/votar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opcaoId }),
    });
  }

  async function salvarAvaliacao() {
    if (!notaTemp) return;
    setSalvandoAvaliacao(true);
    const res = await fetch(`/api/sessao/${sessao.id}/avaliacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota: notaTemp, comentario }),
    });
    const data = await res.json();
    setAvaliacao(data);
    setSalvandoAvaliacao(false);
  }

  const totalVotos = enquete?.respostas.length ?? 0;
  const contagemPorOpcao = (opcaoId: string) =>
    enquete?.respostas.filter((r) => r.opcaoId === opcaoId).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <Link href="/participante/area" className="text-sm text-gray-400 hover:text-gray-600">← Voltar</Link>
        <h1 className="font-bold text-gray-900 mt-1 text-lg leading-tight">{sessao.title}</h1>
        {sessao.speakers.length > 0 && (
          <p className="text-sm text-gray-500 mt-0.5">{sessao.speakers.map((s) => s.name).join(", ")}</p>
        )}
        {sessao.location && (
          <p className="text-xs text-gray-400 mt-0.5">📍 {sessao.location}</p>
        )}
      </div>

      {/* Abas */}
      <div className="flex bg-white border-b border-gray-100 px-4">
        {[
          { key: "perguntas", label: `💬 Perguntas${perguntas.length > 0 ? ` (${perguntas.length})` : ""}` },
          { key: "enquete", label: `📊 Enquete${enquete ? " ●" : ""}` },
          { key: "avaliacao", label: `⭐ Avaliar` },
        ].map((a) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key as typeof aba)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${aba === a.key ? "border-[#00A859] text-[#00A859]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Perguntas */}
        {aba === "perguntas" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-700 mb-2">Envie sua pergunta</p>
              <textarea
                value={textoPergunta}
                onChange={(e) => setTextoPergunta(e.target.value)}
                placeholder="Digite sua pergunta para o palestrante..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A859]"
              />
              {perguntaEnviada && (
                <p className="text-green-600 text-sm mt-2">✓ Pergunta enviada! Aguarde aprovação do moderador.</p>
              )}
              <button
                onClick={enviarPergunta}
                disabled={enviandoPergunta || !textoPergunta.trim()}
                className="mt-2 w-full bg-[#00A859] text-white font-semibold py-2.5 rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50 text-sm"
              >
                {enviandoPergunta ? "Enviando..." : "Enviar pergunta"}
              </button>
            </div>

            {perguntas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Nenhuma pergunta aprovada ainda.</p>
            ) : (
              perguntas.map((p) => (
                <div key={p.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${p.respondida ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
                  <p className="text-sm text-gray-800">{p.texto}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{p.participant.name}</span>
                    {p.respondida && <span className="text-xs text-green-600 font-medium">✓ Respondida</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Enquete */}
        {aba === "enquete" && (
          <div>
            {!enquete ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm">Nenhuma enquete ativa no momento.</p>
                <p className="text-xs mt-1">O moderador lançará uma enquete em breve.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">{enquete.pergunta}</h2>
                <div className="space-y-3">
                  {enquete.opcoes.map((opcao) => {
                    const votos = contagemPorOpcao(opcao.id);
                    const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
                    const selecionada = votou === opcao.id;
                    return (
                      <button
                        key={opcao.id}
                        onClick={() => votar(opcao.id)}
                        disabled={!!votou}
                        className={`w-full text-left rounded-xl border-2 p-3 transition-all ${selecionada ? "border-[#00A859] bg-green-50" : votou ? "border-gray-100 bg-gray-50" : "border-gray-200 hover:border-[#00A859]"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{opcao.texto}</span>
                          {votou && <span className="text-xs text-gray-500 font-semibold">{pct}%</span>}
                        </div>
                        {votou && (
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: "#00A859" }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {votou && <p className="text-xs text-gray-400 text-center mt-4">{totalVotos} voto(s)</p>}
              </div>
            )}
          </div>
        )}

        {/* Avaliação */}
        {aba === "avaliacao" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {avaliacao ? (
              <div className="text-center">
                <p className="text-4xl mb-2">{"⭐".repeat(avaliacao.nota)}</p>
                <p className="font-semibold text-gray-900">Você avaliou esta sessão!</p>
                {avaliacao.comentario && <p className="text-sm text-gray-500 mt-2 italic">"{avaliacao.comentario}"</p>}
                <button onClick={() => setAvaliacao(null)} className="mt-4 text-sm text-[#00A859] hover:underline">
                  Alterar avaliação
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-gray-900 mb-4">Como foi esta sessão?</h2>
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setNotaTemp(n)}
                      className={`text-3xl transition-transform hover:scale-110 ${notaTemp >= n ? "opacity-100" : "opacity-30"}`}>
                      ⭐
                    </button>
                  ))}
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentário opcional..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00A859]"
                />
                <button
                  onClick={salvarAvaliacao}
                  disabled={!notaTemp || salvandoAvaliacao}
                  className="mt-3 w-full bg-[#00A859] text-white font-semibold py-2.5 rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50 text-sm"
                >
                  {salvandoAvaliacao ? "Salvando..." : "Enviar avaliação"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
