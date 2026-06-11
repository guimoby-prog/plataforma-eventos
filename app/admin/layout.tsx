import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/eventos", label: "Eventos", icon: "📅" },
  { href: "/admin/inscritos", label: "Inscritos", icon: "👥" },
  { href: "/admin/palestrantes", label: "Palestrantes", icon: "🎤" },
  { href: "/admin/programacao", label: "Programação", icon: "📋" },
  { href: "/admin/credenciamento", label: "Credenciamento", icon: "✅" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Plataforma Eventos</p>
          <p className="font-bold text-lg">Painel Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-700 space-y-2">
          <Link href="/" className="block text-xs text-gray-400 hover:text-white transition-colors">
            ← Ver hotsite
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
