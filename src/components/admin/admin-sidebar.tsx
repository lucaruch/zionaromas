import Link from "next/link";
import { BarChart3, Boxes, Images, LayoutDashboard, Package, Settings, Tags, Ticket, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/pedidos", label: "Pedidos", icon: Boxes },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/relatorios", label: "Gráficos", icon: BarChart3 }
];

export function AdminSidebar() {
  return (
    <aside className="h-max rounded-lg border border-black/10 bg-black p-4 text-white lg:sticky lg:top-28">
      <p className="mb-4 px-3 text-xs uppercase tracking-[0.18em] text-gold">Admin ZION</p>
      <nav className="grid gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-white/72 transition hover:bg-white/10 hover:text-gold">
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
