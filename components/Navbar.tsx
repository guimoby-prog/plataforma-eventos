import Link from "next/link";

export default function Navbar({ eventName }: { eventName: string }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {eventName}
        </Link>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/#programacao" className="hover:text-blue-600 transition-colors">Programação</Link>
          <Link href="/#palestrantes" className="hover:text-blue-600 transition-colors">Palestrantes</Link>
          <Link href="/participante/area" className="hover:text-blue-600 transition-colors">Minha área</Link>
          <Link href="/inscricao" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Inscreva-se
          </Link>
        </div>
      </div>
    </nav>
  );
}
