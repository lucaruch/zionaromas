"use client";

import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin-session", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button
      onClick={logout}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-black text-white transition hover:border-gold hover:text-gold"
      aria-label="Sair do admin"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
