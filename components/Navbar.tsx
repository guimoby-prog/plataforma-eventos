import Link from "next/link";

export default function Navbar({ eventName }: { eventName: string }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#00A859"/>
            <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z" fill="white"/>
          </svg>
          <div className="leading-tight">
            <span className="text-[11px] font-semibold text-[#00A859] uppercase tracking-widest block">Unimed</span>
            <span className="text-sm font-bold text-gray-800">{eventName}</span>
          </div>
        </Link>

        <div className="flex gap-6 text-sm font-medium text-gray-600 items-center">
          <Link href="/#programacao" className="hover:text-[#00A859] transition-colors">Programação</Link>
          <Link href="/#palestrantes" className="hover:text-[#00A859] transition-colors">Palestrantes</Link>
          <Link href="/participante/area" className="hover:text-[#00A859] transition-colors">Minha área</Link>
          <Link href="/inscricao" className="bg-[#00A859] text-white px-4 py-2 rounded-lg hover:bg-[#008C45] transition-colors font-semibold">
            Inscreva-se
          </Link>
        </div>
      </div>
    </nav>
  );
}
