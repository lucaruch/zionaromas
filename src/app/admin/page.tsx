import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { products } from "@/lib/data";

const recentOrders = [
  ["ZA-1040", "Marina Lima", "R$ 579,80", "Pago"],
  ["ZA-1039", "Rafael Costa", "R$ 249,90", "Separação"],
  ["ZA-1038", "Bianca Alves", "R$ 159,90", "Enviado"]
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-deep">Painel administrativo aberto</p>
        <h1 className="mt-3 font-display text-5xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento" value="R$ 48.920" trend="+18% no mês" icon={DollarSign} />
        <StatCard label="Pedidos" value="326" trend="42 em separação" icon={ShoppingCart} />
        <StatCard label="Produtos vendidos" value="812" trend="Noir Absolu lidera" icon={Package} />
        <StatCard label="Clientes" value="1.248" trend="+96 novos" icon={Users} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="font-display text-3xl">Gráfico de faturamento</h2>
          <div className="mt-8 flex h-72 items-end gap-3 border-b border-l border-black/10 px-4">
            {[42, 58, 46, 72, 66, 88, 93, 78, 102, 118, 132, 148].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t bg-gold-metal" style={{ height }} />
                <span className="text-[10px] text-black/40">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="font-display text-3xl">Pedidos recentes</h2>
          <div className="mt-6 grid gap-3">
            {recentOrders.map(([code, customer, total, status]) => (
              <div key={code} className="flex items-center justify-between rounded-md bg-pearl p-4 text-sm">
                <div>
                  <strong>{code}</strong>
                  <p className="text-black/50">{customer}</p>
                </div>
                <div className="text-right">
                  <strong>{total}</strong>
                  <p className="text-gold-deep">{status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="font-display text-3xl">Produtos mais vendidos</h2>
        <div className="mt-6 grid gap-3">
          {products.filter((product) => product.bestSeller).map((product, index) => (
            <div key={product.slug} className="flex items-center justify-between rounded-md bg-pearl p-4">
              <span>{index + 1}. {product.name}</span>
              <strong>{product.reviews + 40} vendas</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
