import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminCategories, getAdminCustomers, getAdminOrders } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

export default async function AdminReportsPage() {
  const [orders, customers, categories] = await Promise.all([
    getAdminOrders(),
    getAdminCustomers(),
    getAdminCategories()
  ]);
  const revenue = orders.reduce((total, order) => total + Number(order.total), 0);
  const items = orders.reduce((total, order) => total + order.items, 0);
  const averageTicket = orders.length ? revenue / orders.length : 0;
  const itemsPerOrder = orders.length ? items / orders.length : 0;
  const maxCategoryProducts = Math.max(...categories.map((category) => category.productCount), 1);

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Visão da operação</p>
      <h1 className="mt-2 text-3xl font-black text-white">Desempenho da loja</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
        Acompanhe os principais indicadores de pedidos, clientes e marcas cadastradas na ZION AROMAS.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento" value={formatCurrency(revenue)} icon={DollarSign} />
        <StatCard label="Pedidos" value={String(orders.length)} icon={ShoppingCart} />
        <StatCard label="Ticket médio" value={formatCurrency(averageTicket)} icon={Package} />
        <StatCard label="Clientes" value={String(customers.length)} icon={Users} />
      </div>
      <div className="mt-5 border border-gold/18 bg-[#0d0b08] p-6 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        <h2 className="text-2xl font-black text-white">Produtos por marca</h2>
        <p className="mt-2 text-sm text-white/55">Distribuição real do catálogo cadastrado.</p>
        <div className="mt-8 grid gap-4">
          {categories.map((category) => {
            const width = Math.round((category.productCount / maxCategoryProducts) * 100);
            return (
              <div key={category.id}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-white/72">{category.name}</span>
                  <strong className="text-gold">{category.productCount} produto(s)</strong>
                </div>
                <div className="h-3 rounded-full bg-white/[0.06]">
                  <div className="h-3 rounded-full bg-gold-metal" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
          {!categories.length ? <p className="text-sm text-white/50">Nenhuma marca cadastrada.</p> : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="border border-gold/18 bg-[#0d0b08] p-6 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Operação</p>
          <strong className="mt-3 block text-3xl text-white">{itemsPerOrder.toFixed(1)}</strong>
          <p className="mt-2 text-sm text-white/55">Itens por pedido em média.</p>
        </div>
        <div className="border border-gold/18 bg-[#0d0b08] p-6 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Catálogo</p>
          <strong className="mt-3 block text-3xl text-white">{categories.length}</strong>
          <p className="mt-2 text-sm text-white/55">Marcas cadastradas para venda.</p>
        </div>
      </div>
    </div>
  );
}
