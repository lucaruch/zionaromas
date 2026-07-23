"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, MessageSquare, Package, Settings, Ticket } from "lucide-react";
import type { AdminStats } from "@/lib/admin-data";

export function AdminSidebar({ stats }: { stats: AdminStats }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin/produtos", label: "Produtos", count: stats.products, icon: Package },
    { href: "/admin/pedidos", label: "Pedidos", count: stats.openOrders, icon: Boxes },
    { href: "/admin/mensagens", label: "Mensagens", count: stats.newMessages, icon: MessageSquare },
    { href: "/admin/clientes", label: "Clientes", count: stats.customers, icon: MessageSquare },
    { href: "/admin/cupons", label: "Cupons", count: stats.activeCoupons, icon: Ticket },
    { href: "/admin/configuracoes", label: "Configurações", count: 2, icon: Settings }
  ];

  return (
    <aside className="grid h-max min-w-0 gap-4">
      <nav className="grid gap-2 border border-gold/18 bg-[#0d0b08] p-2 shadow-[0_18px_50px_rgba(0,0,0,.28)] sm:grid-cols-2 lg:grid-cols-1">
        {links.map(({ href, label, count, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "flex min-w-0 items-center justify-between gap-3 rounded-md bg-gold-metal px-4 py-4 text-sm font-black text-black"
                  : "flex min-w-0 items-center justify-between gap-3 rounded-md px-4 py-4 text-sm font-semibold text-white/72 transition hover:bg-white/[0.04] hover:text-gold"
              }
            >
              <span className="inline-flex min-w-0 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </span>
              <span className={active ? "shrink-0 text-black" : "shrink-0 text-gold/70"}>{count}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden border border-gold/18 bg-[#0d0b08] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)] lg:block">
        <p className="mb-6 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Resumo operacional</p>
        {[
          ["Produtos cadastrados", stats.products],
          ["Pedidos em aberto", stats.openOrders],
          ["Mensagens novas", stats.newMessages],
          ["Clientes", stats.customers],
          ["Cupons ativos", stats.activeCoupons]
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-gold/12 py-3 text-sm last:border-0">
            <span className="text-white/58">{label}</span>
            <strong className="text-gold">{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
