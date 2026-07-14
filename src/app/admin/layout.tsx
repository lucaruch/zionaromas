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
    <section className="min-h-screen bg-[#eeeeef] px-4 py-9 text-[#090b13]">
      <div className="mx-auto max-w-[1226px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#252b42]/60">ZION AROMAS</p>
            <h1 className="mt-1 text-2xl font-black">Painel administrativo</h1>
          </div>
          <AdminLogoutButton />
        </div>
        <div className="grid gap-5 lg:grid-cols-[216px_1fr]">
          <AdminSidebar />
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
