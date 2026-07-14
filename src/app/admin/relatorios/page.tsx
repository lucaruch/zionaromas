import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Relatórios</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ticket médio" value="R$ 318" icon={DollarSign} />
        <StatCard label="Conversão" value="4,8%" icon={ShoppingCart} />
        <StatCard label="Itens por pedido" value="2,4" icon={Package} />
        <StatCard label="Recorrência" value="31%" icon={Users} />
      </div>
      <div className="mt-5 rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Performance por categoria</h2>
        <div className="mt-8 grid gap-4">
          {["Perfumes Autorais", "Aromas de Ambiente", "Velas Premium", "Kits Presente"].map((category, index) => (
            <div key={category}>
              <div className="mb-2 flex justify-between text-sm">
                <span>{category}</span>
                <strong>{62 + index * 9}%</strong>
              </div>
              <div className="h-3 rounded-full bg-[#f1f1f3]">
                <div className="h-3 rounded-full bg-black" style={{ width: `${62 + index * 9}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
