import Image from "next/image";
import Link from "next/link";
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
        <div className="mx-auto flex min-h-[76px] max-w-[1226px] items-center justify-between gap-4 px-4 py-4 sm:min-h-[88px] sm:py-5">
          <Link href="/admin/produtos" className="flex items-center gap-3">
            <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={54} height={54} className="h-11 w-11 object-contain sm:h-12 sm:w-12" />
            <div>
              <p className="text-lg font-black leading-none tracking-[0.08em]">ZION</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.42em] text-gold">Aromas</p>
            </div>
          </Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1226px] gap-5 px-4 py-6 sm:py-9 lg:grid-cols-[216px_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </main>
    </section>
  );
}
