import Link from "next/link";

type NavbarProps = {
  eventName: string;
  primaryColor?: string;
  logoUrl?: string | null;
};

function LogoUnimed({ color = "#00A859" }: { color?: string }) {
  return (
    <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Texto "Unimed" */}
      <text x="0" y="23" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill={color}>Unimed</text>
      {/* Símbolo da árvore/folha Unimed */}
      <g transform="translate(95, 2)">
        <path d="M12 2C12 2 6 6 4 10C2 14 4 18 8 19C8 19 7 22 6 24H10C10 24 10 21 11 19.5C11.3 19.5 11.7 19.5 12 19.5C15.3 19.5 18 16.8 18 13.5C18 10.5 16 8 13.5 7C14.5 5 14 3 12 2Z" fill={color}/>
        <path d="M12 8C10 9 8.5 11 8.5 13.5C8.5 15 9 16.3 10 17.2C10.5 15 11.5 12 12 8Z" fill="white" opacity="0.4"/>
      </g>
    </svg>
  );
}

export default function Navbar({ eventName, primaryColor = "#00A859", logoUrl }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-8 object-contain" />
          ) : (
            <LogoUnimed color={primaryColor} />
          )}
          <div className="border-l border-gray-200 pl-3 leading-tight">
            <span className="text-xs text-gray-400 block">Evento</span>
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
