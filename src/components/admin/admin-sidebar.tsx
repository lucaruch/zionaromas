"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, MessageSquare, Package, Ticket } from "lucide-react";
import { products } from "@/lib/data";

const links = [
  { href: "/admin/produtos", label: "Produtos", count: products.length, icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", count: 3, icon: Boxes },
  { href: "/admin/clientes", label: "Mensagens", count: 3, icon: MessageSquare },
  { href: "/admin/cupons", label: "Cupons", count: 2, icon: Ticket }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="grid h-max gap-4">
      <nav className="border border-gold/18 bg-[#0d0b08] p-2 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        {links.map(({ href, label, count, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "flex items-center justify-between rounded-md bg-gold-metal px-4 py-4 text-sm font-black text-black"
                  : "flex items-center justify-between rounded-md px-4 py-4 text-sm font-semibold text-white/72 transition hover:bg-white/[0.04] hover:text-gold"
              }
            >
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              <span className={active ? "text-black" : "text-gold/70"}>{count}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border border-gold/18 bg-[#0d0b08] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        <p className="mb-6 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Resumo operacional</p>
        {[
          ["Produtos ativos", products.length],
          ["Pedidos abertos", 3],
          ["Mensagens pendentes", 3],
          ["Cupons ativos", 2]
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
