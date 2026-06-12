import Link from "next/link";

type NavbarProps = {
  eventName: string;
  primaryColor?: string;
  logoUrl?: string | null;
};

export default function Navbar({ eventName, primaryColor = "#00A859", logoUrl }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-8 object-contain" />
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill={primaryColor} />
              <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7z" fill="white" />
            </svg>
          )}
          <div className="leading-tight">
            <span className="text-[11px] font-semibold uppercase tracking-widest block" style={{ color: primaryColor }}>Unimed</span>
            <span className="text-sm font-bold text-gray-800">{eventName}</span>
          </div>
        </Link>

        <div className="flex gap-6 text-sm font-medium text-gray-600 items-center">
          <Link href="/#programacao" className="transition-colors hover:opacity-80">Programação</Link>
          <Link href="/#palestrantes" className="transition-colors hover:opacity-80">Palestrantes</Link>
          <Link href="/participante/area" className="transition-colors hover:opacity-80">Minha área</Link>
          <Link href="/inscricao" className="text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            style={{ background: primaryColor }}>
            Inscreva-se
          </Link>
        </div>
      </div>
    </nav>
  );
}
