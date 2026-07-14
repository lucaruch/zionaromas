import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="font-display text-5xl">Relatórios</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ticket médio" value="R$ 318" trend="+7% no mês" icon={DollarSign} />
        <StatCard label="Conversão" value="4,8%" trend="+0,9pp" icon={ShoppingCart} />
        <StatCard label="Itens por pedido" value="2,4" trend="Kits puxam alta" icon={Package} />
        <StatCard label="Recorrência" value="31%" trend="Clientes 90 dias" icon={Users} />
      </div>
      <div className="mt-8 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="font-display text-3xl">Performance por categoria</h2>
        <div className="mt-8 grid gap-4">
          {["Perfumes Autorais", "Aromas de Ambiente", "Velas Premium", "Kits Presente"].map((category, index) => (
            <div key={category}>
              <div className="mb-2 flex justify-between text-sm"><span>{category}</span><strong>{62 + index * 9}%</strong></div>
              <div className="h-3 rounded-full bg-pearl"><div className="h-3 rounded-full bg-gold-metal" style={{ width: `${62 + index * 9}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
