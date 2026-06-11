"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
      Sair do admin
    </button>
  );
}
