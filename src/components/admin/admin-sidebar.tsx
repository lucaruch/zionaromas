import Link from "next/link";
import { Boxes, MessageSquare, Package, Ticket } from "lucide-react";
import { products } from "@/lib/data";

const links = [
  { href: "/admin/produtos", label: "Produtos", count: products.length, icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", count: 3, icon: Boxes },
  { href: "/admin/clientes", label: "Mensagens", count: 0, icon: MessageSquare },
  { href: "/admin/cupons", label: "Cupons", count: 0, icon: Ticket }
];

export function AdminSidebar() {
  return (
    <aside className="grid gap-4">
      <nav className="rounded-lg border border-black/10 bg-white p-2 shadow-sm">
        {links.map(({ href, label, count, icon: Icon }, index) => (
          <Link
            key={href}
            href={href}
            className={
              index === 0
                ? "flex items-center justify-between rounded-md bg-black px-4 py-4 text-sm font-semibold text-white"
                : "flex items-center justify-between rounded-md px-4 py-4 text-sm font-semibold text-[#20283f] transition hover:bg-black/5"
            }
          >
            <span className="inline-flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            <span className={index === 0 ? "text-white" : "text-black/45"}>{count}</span>
          </Link>
        ))}
      </nav>
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#222a43]/70">Resumo operacional</p>
        {[
          ["Produtos ativos", products.length],
          ["Pedidos abertos", 0],
          ["Mensagens pendentes", 0],
          ["Cupons ativos", 0]
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-black/10 py-3 text-sm last:border-0">
            <span className="text-[#626a80]">{label}</span>
            <strong className="text-black">{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
