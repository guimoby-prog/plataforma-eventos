import Link from "next/link";
import Navbar from "@/components/Navbar";

const EVENT = {
  name: "Congresso de Exemplo 2026",
  date: "15 a 17 de Agosto de 2026",
  location: "Centro de Convenções — São Paulo, SP",
  description: "O maior evento do setor, reunindo líderes, especialistas e profissionais para três dias de conteúdo, networking e inovação.",
  sessions: [
    { id: "1", time: "09:00", title: "Abertura Oficial", speaker: "Diretoria", location: "Plenária Principal", day: "15/08", track: "Institucional" },
    { id: "2", time: "10:00", title: "Inovação e Transformação Digital", speaker: "Dr. Carlos Mendes", location: "Auditório A", day: "15/08", track: "Tecnologia" },
    { id: "3", time: "14:00", title: "Sustentabilidade no Setor", speaker: "Ana Paula Lima", location: "Auditório B", day: "15/08", track: "Gestão" },
    { id: "4", time: "09:00", title: "Liderança e Cultura Organizacional", speaker: "Marcos Teixeira", location: "Plenária Principal", day: "16/08", track: "Gestão" },
    { id: "5", time: "11:00", title: "Inteligência Artificial na Prática", speaker: "Dra. Sofia Ramos", location: "Auditório A", day: "16/08", track: "Tecnologia" },
    { id: "6", time: "16:00", title: "Encerramento e Premiação", speaker: "Diretoria", location: "Plenária Principal", day: "17/08", track: "Institucional" },
  ],
  speakers: [
    { id: "1", name: "Dr. Carlos Mendes", bio: "Especialista em transformação digital com 20 anos de experiência.", role: "Palestrante" },
    { id: "2", name: "Ana Paula Lima", bio: "Referência nacional em sustentabilidade corporativa.", role: "Palestrante" },
    { id: "3", name: "Marcos Teixeira", bio: "CEO premiado e autor de bestsellers sobre liderança.", role: "Moderador" },
    { id: "4", name: "Dra. Sofia Ramos", bio: "Pesquisadora de IA aplicada ao setor de saúde.", role: "Palestrante" },
  ],
};

const DAYS = ["15/08", "16/08", "17/08"];
const DAY_LABELS: Record<string, string> = { "15/08": "Dia 1", "16/08": "Dia 2", "17/08": "Dia 3" };

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar eventName={EVENT.name} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 font-medium mb-3 tracking-wide uppercase text-sm">{EVENT.date}</p>
          <h1 className="text-5xl font-bold mb-4">{EVENT.name}</h1>
          <p className="text-blue-100 text-lg mb-2">{EVENT.location}</p>
          <p className="text-blue-200 max-w-2xl mx-auto mt-4 leading-relaxed">{EVENT.description}</p>
          <Link href="/inscricao" className="mt-8 inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg">
            Garantir minha vaga
          </Link>
        </div>
      </section>

      {/* Programação */}
      <section id="programacao" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Programação</h2>
          {DAYS.map((day) => (
            <div key={day} className="mb-10">
              <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-100 pb-2">
                {DAY_LABELS[day]} — {day}
              </h3>
              <div className="space-y-3">
                {EVENT.sessions.filter((s) => s.day === day).map((session) => (
                  <div key={session.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4 items-start">
                    <span className="text-blue-600 font-bold text-sm min-w-[50px]">{session.time}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{session.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{session.speaker} · {session.location}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">{session.track}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Palestrantes */}
      <section id="palestrantes" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Palestrantes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EVENT.speakers.map((speaker) => (
              <div key={speaker.id} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                  {speaker.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900">{speaker.name}</h3>
                <p className="text-xs text-blue-600 font-medium mt-1 mb-2">{speaker.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{speaker.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-blue-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Não perca esta oportunidade</h2>
        <p className="text-blue-200 mb-8 text-lg">Vagas limitadas. Inscreva-se agora e garanta sua participação.</p>
        <Link href="/inscricao" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg inline-block">
          Fazer inscrição
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© 2026 {EVENT.name}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
