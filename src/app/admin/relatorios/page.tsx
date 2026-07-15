import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { categories } from "@/lib/data";

export default function AdminReportsPage() {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Visão da operação</p>
      <h1 className="mt-2 text-3xl font-black text-white">Desempenho da loja</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
        Acompanhe os principais indicadores para entender vendas, comportamento de compra e marcas com maior procura.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ticket médio" value="R$ 318" icon={DollarSign} />
        <StatCard label="Taxa de conversão" value="4,8%" icon={ShoppingCart} />
        <StatCard label="Itens por pedido" value="2,4" icon={Package} />
        <StatCard label="Clientes recorrentes" value="31%" icon={Users} />
      </div>
      <div className="mt-5 border border-gold/18 bg-[#0d0b08] p-6 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        <h2 className="text-2xl font-black text-white">Procura por marca</h2>
        <p className="mt-2 text-sm text-white/55">Marcas que mais geraram interesse no período.</p>
        <div className="mt-8 grid gap-4">
          {categories.slice(0, 4).map((category, index) => (
            <div key={category.slug}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-white/72">{category.name}</span>
                <strong className="text-gold">{62 + index * 9}%</strong>
              </div>
              <div className="h-3 rounded-full bg-white/[0.06]">
                <div className="h-3 rounded-full bg-gold-metal" style={{ width: `${62 + index * 9}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
