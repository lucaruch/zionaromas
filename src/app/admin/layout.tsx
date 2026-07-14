import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isAdminUnlocked } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const unlocked = await isAdminUnlocked();

  if (!unlocked) {
    return <AdminPasswordGate />;
  }

  return (
    <section className="min-h-screen bg-[#070604] text-white">
      <header className="border-b border-gold/20 bg-black">
        <div className="mx-auto flex h-[88px] max-w-[1226px] items-center justify-between gap-4 px-4 py-5">
          <Link href="/admin/produtos" className="flex items-center gap-3">
            <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={54} height={54} className="h-12 w-12 object-contain" />
            <div>
              <p className="text-lg font-black leading-none tracking-[0.08em]">ZION</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.42em] text-gold">Aromas</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden h-10 items-center gap-2 rounded-full border border-gold/25 px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:border-gold hover:text-gold sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" />
              Ver loja
            </Link>
            <Link
              href="/admin/produtos"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-metal px-5 text-[10px] font-black uppercase tracking-[0.16em] text-black shadow-[0_14px_35px_rgba(212,175,55,.24)] transition hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1226px] gap-5 px-4 py-9 lg:grid-cols-[216px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </main>
    </section>
  );
}
