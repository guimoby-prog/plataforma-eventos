"use client";

import { useState } from "react";
import Link from "next/link";

type Secao = {
  id: string;
  tipo: string;
  titulo: string | null;
  conteudo: string;
  ordem: number;
  visivel: boolean;
  bgColor: string;
  textColor: string;
  padding: string;
  align: string;
};

const TIPOS = [
  { valor: "video", label: "Vídeo", emoji: "🎬", desc: "Embed de YouTube ou Vimeo" },
  { valor: "patrocinadores", label: "Patrocinadores", emoji: "🤝", desc: "Logos dos apoiadores" },
  { valor: "numeros", label: "Números do evento", emoji: "📊", desc: "Estatísticas em destaque" },
  { valor: "depoimentos", label: "Depoimentos", emoji: "💬", desc: "Avaliações de participantes" },
  { valor: "faq", label: "FAQ", emoji: "❓", desc: "Perguntas frequentes" },
  { valor: "texto", label: "Bloco de texto", emoji: "📝", desc: "Texto livre com título" },
  { valor: "banner", label: "Banner / Imagem", emoji: "🖼️", desc: "Imagem de destaque" },
];

const PADDINGS = [
  { valor: "py-8", label: "Pequeno" },
  { valor: "py-16", label: "Médio" },
  { valor: "py-24", label: "Grande" },
  { valor: "py-32", label: "Enorme" },
];

const ALIGNS = [
  { valor: "left", label: "Esquerda" },
  { valor: "center", label: "Centro" },
  { valor: "right", label: "Direita" },
];

function conteudoInicial(tipo: string): object {
  switch (tipo) {
    case "video": return { url: "", legenda: "" };
    case "patrocinadores": return { items: [{ nome: "", logoUrl: "", siteUrl: "" }] };
    case "numeros": return { items: [{ numero: "", descricao: "" }] };
    case "depoimentos": return { items: [{ nome: "", cargo: "", texto: "", fotoUrl: "" }] };
    case "faq": return { items: [{ pergunta: "", resposta: "" }] };
    case "texto": return { texto: "" };
    case "banner": return { imageUrl: "", link: "" };
    default: return {};
  }
}

function EditorConteudo({ tipo, conteudo, onChange }: { tipo: string; conteudo: object; onChange: (c: object) => void }) {
  const c = conteudo as Record<string, unknown>;

  if (tipo === "video") {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">URL do vídeo (YouTube ou Vimeo)</label>
        <input value={(c.url as string) ?? ""}
          onChange={(e) => onChange({ ...c, url: e.target.value })}
          placeholder="https://www.youtube.com/embed/..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
        <input value={(c.legenda as string) ?? ""}
          onChange={(e) => onChange({ ...c, legenda: e.target.value })}
          placeholder="Legenda abaixo do vídeo (opcional)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
      </div>
    );
  }

  if (tipo === "banner") {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">URL da imagem</label>
        <input value={(c.imageUrl as string) ?? ""}
          onChange={(e) => onChange({ ...c, imageUrl: e.target.value })}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
        <input value={(c.link as string) ?? ""}
          onChange={(e) => onChange({ ...c, link: e.target.value })}
          placeholder="Link ao clicar (opcional)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
      </div>
    );
  }

  if (tipo === "texto") {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Conteúdo</label>
        <textarea value={(c.texto as string) ?? ""}
          onChange={(e) => onChange({ ...c, texto: e.target.value })}
          rows={6}
          placeholder="Escreva o texto aqui..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
      </div>
    );
  }

  // Tipos com lista de itens
  const items = (c.items as Record<string, string>[]) ?? [];
  const campos: Record<string, { label: string; placeholder: string }[]> = {
    patrocinadores: [
      { label: "Nome", placeholder: "Nome da empresa" },
      { label: "Logo URL", placeholder: "https://..." },
      { label: "Site", placeholder: "https://site.com.br" },
    ],
    numeros: [
      { label: "Número", placeholder: "2.000+" },
      { label: "Descrição", placeholder: "Participantes" },
    ],
    depoimentos: [
      { label: "Nome", placeholder: "Nome da pessoa" },
      { label: "Cargo", placeholder: "Cargo / Empresa" },
      { label: "Depoimento", placeholder: "O que a pessoa disse..." },
      { label: "Foto URL", placeholder: "https://..." },
    ],
    faq: [
      { label: "Pergunta", placeholder: "Qual é a pergunta?" },
      { label: "Resposta", placeholder: "Escreva a resposta..." },
    ],
  };

  const chaves: Record<string, string[]> = {
    patrocinadores: ["nome", "logoUrl", "siteUrl"],
    numeros: ["numero", "descricao"],
    depoimentos: ["nome", "cargo", "texto", "fotoUrl"],
    faq: ["pergunta", "resposta"],
  };

  const fs = campos[tipo] ?? [];
  const ks = chaves[tipo] ?? [];

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Item {i + 1}</span>
            <button onClick={() => onChange({ ...c, items: items.filter((_, j) => j !== i) })}
              className="text-red-400 hover:text-red-600 text-sm">✕ remover</button>
          </div>
          {fs.map((f, fi) => (
            <input key={fi} value={item[ks[fi]] ?? ""}
              onChange={(e) => {
                const novoItem = { ...item, [ks[fi]]: e.target.value };
                const novos = [...items];
                novos[i] = novoItem;
                onChange({ ...c, items: novos });
              }}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
          ))}
        </div>
      ))}
      <button onClick={() => {
        const novo: Record<string, string> = {};
        ks.forEach((k) => { novo[k] = ""; });
        onChange({ ...c, items: [...items, novo] });
      }} className="text-sm text-[#00A859] hover:underline font-medium">+ Adicionar item</button>
    </div>
  );
}

function CardSecao({ secao, eventId, onUpdate, onDelete, onMover, isFirst, isLast }: {
  secao: Secao;
  eventId: string;
  onUpdate: (s: Secao) => void;
  onDelete: () => void;
  onMover: (dir: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [aberta, setAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState(secao);
  const [conteudo, setConteudo] = useState<object>(JSON.parse(secao.conteudo || "{}"));

  const tipo = TIPOS.find((t) => t.valor === secao.tipo);

  async function salvar() {
    setSalvando(true);
    const res = await fetch(`/api/admin/eventos/${eventId}/secoes/${secao.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, conteudo: JSON.stringify(conteudo) }),
    });
    const atualizada = await res.json();
    onUpdate(atualizada);
    setAberta(false);
    setSalvando(false);
  }

  async function alternarVisivel() {
    const res = await fetch(`/api/admin/eventos/${eventId}/secoes/${secao.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, conteudo: JSON.stringify(conteudo), visivel: !dados.visivel }),
    });
    const atualizada = await res.json();
    setDados(atualizada);
    onUpdate(atualizada);
  }

  async function excluir() {
    if (!confirm("Excluir esta seção?")) return;
    await fetch(`/api/admin/eventos/${eventId}/secoes/${secao.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${!dados.visivel ? "opacity-60" : ""}`}>
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setAberta(!aberta)}>
        <div className="flex flex-col gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); onMover("up"); }}
            disabled={isFirst}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▲</button>
          <button onClick={(e) => { e.stopPropagation(); onMover("down"); }}
            disabled={isLast}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▼</button>
        </div>
        <span className="text-2xl">{tipo?.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{dados.titulo || tipo?.label}</p>
          <p className="text-xs text-gray-400">{tipo?.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); alternarVisivel(); }}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${dados.visivel ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {dados.visivel ? "Visível" : "Oculto"}
          </button>
          <span className="text-gray-300">{aberta ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Editor */}
      {aberta && (
        <div className="border-t border-gray-100 p-5 space-y-5">
          {/* Título da seção */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Título da seção</label>
            <input value={dados.titulo ?? ""}
              onChange={(e) => setDados((d) => ({ ...d, titulo: e.target.value }))}
              placeholder={tipo?.label}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]" />
          </div>

          {/* Conteúdo específico do tipo */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Conteúdo</label>
            <EditorConteudo tipo={secao.tipo} conteudo={conteudo} onChange={setConteudo} />
          </div>

          {/* Configuração visual */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identidade Visual da Seção</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1.5">Cor de fundo</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={dados.bgColor}
                    onChange={(e) => setDados((d) => ({ ...d, bgColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <span className="text-xs text-gray-500 font-mono">{dados.bgColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1.5">Cor do texto</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={dados.textColor}
                    onChange={(e) => setDados((d) => ({ ...d, textColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                  <span className="text-xs text-gray-500 font-mono">{dados.textColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1.5">Espaçamento vertical</label>
                <select value={dados.padding}
                  onChange={(e) => setDados((d) => ({ ...d, padding: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]">
                  {PADDINGS.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1.5">Alinhamento</label>
                <select value={dados.align}
                  onChange={(e) => setDados((d) => ({ ...d, align: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]">
                  {ALIGNS.map((a) => <option key={a.valor} value={a.valor}>{a.label}</option>)}
                </select>
              </div>
            </div>

            {/* Preview da aparência */}
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ background: dados.bgColor, color: dados.textColor }}>
              <div className={`px-6 ${dados.padding} text-${dados.align}`}>
                <p className="font-bold text-lg">{dados.titulo || tipo?.label || "Título da seção"}</p>
                <p className="text-sm opacity-70 mt-1">Prévia da identidade visual desta seção</p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center pt-2">
            <button onClick={excluir} className="text-sm text-red-400 hover:text-red-600 font-medium">Excluir seção</button>
            <div className="flex gap-2">
              <button onClick={() => setAberta(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
              <button onClick={salvar} disabled={salvando}
                className="px-5 py-2 bg-[#00A859] text-white text-sm font-semibold rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50">
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConstrutorSecoes({ eventId, secoesIniciais }: { eventId: string; secoesIniciais: Secao[] }) {
  const [secoes, setSecoes] = useState<Secao[]>(secoesIniciais);
  const [adicionando, setAdicionando] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [criando, setCriando] = useState(false);

  async function adicionar() {
    if (!tipoSelecionado) return;
    setCriando(true);
    const res = await fetch(`/api/admin/eventos/${eventId}/secoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tipoSelecionado,
        conteudo: JSON.stringify(conteudoInicial(tipoSelecionado)),
      }),
    });
    const nova = await res.json();
    setSecoes((s) => [...s, nova]);
    setAdicionando(false);
    setTipoSelecionado("");
    setCriando(false);
  }

  async function mover(idx: number, dir: "up" | "down") {
    const novas = [...secoes];
    const outro = dir === "up" ? idx - 1 : idx + 1;
    [novas[idx], novas[outro]] = [novas[outro], novas[idx]];
    const reordenadas = novas.map((s, i) => ({ ...s, ordem: i }));
    setSecoes(reordenadas);
    await fetch(`/api/admin/eventos/${eventId}/secoes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reordenadas.map((s) => ({ id: s.id, ordem: s.ordem }))),
    });
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/eventos" className="text-sm text-gray-400 hover:underline">← Eventos</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Construtor de Seções</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monte o hotsite adicionando e organizando os blocos de conteúdo.</p>
        </div>
        <Link href="/" target="_blank"
          className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600 font-medium">
          Ver hotsite ↗
        </Link>
      </div>

      {/* Lista de seções */}
      <div className="space-y-3 mb-6">
        {secoes.length === 0 && !adicionando && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-4xl mb-3">🧩</p>
            <p className="font-semibold text-gray-700 mb-1">Nenhuma seção adicionada</p>
            <p className="text-sm text-gray-400">Clique em "Adicionar seção" para começar a montar o hotsite.</p>
          </div>
        )}
        {secoes.map((s, i) => (
          <CardSecao key={s.id} secao={s} eventId={eventId}
            onUpdate={(atualizada) => setSecoes((prev) => prev.map((x) => x.id === atualizada.id ? atualizada : x))}
            onDelete={() => setSecoes((prev) => prev.filter((x) => x.id !== s.id))}
            onMover={(dir) => mover(i, dir)}
            isFirst={i === 0}
            isLast={i === secoes.length - 1} />
        ))}
      </div>

      {/* Adicionar seção */}
      {adicionando ? (
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <p className="font-semibold text-gray-800 mb-4">Escolha o tipo de seção</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {TIPOS.map((t) => (
              <button key={t.valor} onClick={() => setTipoSelecionado(t.valor)}
                className={`p-3 rounded-xl border text-left transition-all ${tipoSelecionado === t.valor ? "border-[#00A859] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                <span className="text-2xl block mb-1">{t.emoji}</span>
                <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdicionando(false); setTipoSelecionado(""); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button onClick={adicionar} disabled={!tipoSelecionado || criando}
              className="px-5 py-2 bg-[#00A859] text-white text-sm font-semibold rounded-xl hover:bg-[#008C45] transition-colors disabled:opacity-50">
              {criando ? "Criando..." : "Adicionar"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdicionando(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-4 text-gray-500 hover:border-[#00A859] hover:text-[#00A859] transition-colors font-medium text-sm">
          + Adicionar seção
        </button>
      )}
    </div>
  );
}
