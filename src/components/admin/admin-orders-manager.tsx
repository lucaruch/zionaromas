"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import type { AdminOrder } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  RECEBIDO: "Recebido",
  PAGO: "Pago",
  SEPARACAO: "Separação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado"
};

const paymentLabels: Record<string, string> = {
  PIX: "PIX",
  CARTAO: "Cartão",
  BOLETO: "Boleto"
};

export function AdminOrdersManager({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !normalized ||
        [order.code, order.customerName, order.customerEmail, order.customerPhone, order.postalCode].some((value) =>
          value.toLowerCase().includes(normalized)
        );
      const matchesStatus = status === "all" || order.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  async function updateOrder(order: AdminOrder, patch: Partial<AdminOrder>) {
    setMessage("");
    const nextStatus = patch.status ?? order.status;
    const response = await fetch("/api/admin/pedidos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: order.id,
        status: nextStatus,
        trackingCode: patch.trackingCode ?? order.trackingCode,
        paymentStatus: patch.paymentStatus ?? order.paymentStatus
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Não foi possível atualizar o pedido.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
      <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Gestão de pedidos</p>
          <h1 className="mt-2 text-2xl font-black text-white">Pedidos da loja</h1>
        </div>
        <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">
          {orders.length} pedidos
        </span>
      </div>
      <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_200px]">
        <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar por cliente, pedido, telefone ou CEP" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
          <option value="all">Todos</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {message ? <p className="border-b border-gold/10 px-5 py-3 text-sm text-gold">{message}</p> : null}
      {filteredOrders.map((order) => (
        <article key={order.id} className="grid gap-5 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <strong className="text-base">#{order.code}</strong>
              <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gold">
                {statusLabels[order.status] || order.status}
              </span>
              <span className="text-xs text-white/45">{new Date(order.createdAt).toLocaleString("pt-BR")}</span>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">Cliente</p>
                <p className="mt-2 font-semibold">{order.customerName}</p>
                <p className="mt-1 text-white/55">{order.customerEmail}</p>
                <p className="mt-1 text-white/55">{order.customerPhone || "Telefone não informado"}</p>
                {order.customerDocument ? <p className="mt-1 text-white/55">Documento: {order.customerDocument}</p> : null}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">Entrega</p>
                <p className="mt-2 text-white/72">CEP: {order.postalCode || "Não informado"}</p>
                <p className="mt-1 leading-6 text-white/55">{order.addressLine}</p>
                {order.trackingCode ? <p className="mt-1 text-white/55">Rastreio: {order.trackingCode}</p> : null}
              </div>
            </div>

            <div className="mt-5 overflow-hidden border border-gold/14">
              {order.itemLines.map((item) => (
                <div key={`${order.id}-${item.sku}`} className="grid gap-2 border-b border-gold/10 px-4 py-3 last:border-0 md:grid-cols-[minmax(0,1fr)_90px_120px] md:items-center">
                  <div>
                    <strong>{item.productName}</strong>
                    <p className="mt-1 text-xs text-white/45">SKU: {item.sku}</p>
                  </div>
                  <span className="text-white/62">{item.quantity} un.</span>
                  <strong className="text-gold">{formatCurrency(Number(item.price))}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid h-max gap-3">
            <div className="border border-gold/14 bg-black/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">Resumo</p>
              <div className="mt-3 grid gap-2 text-sm">
                <span className="flex justify-between gap-4"><span className="text-white/55">Total</span><strong className="text-gold">{formatCurrency(Number(order.total))}</strong></span>
                <span className="flex justify-between gap-4"><span className="text-white/55">Pagamento</span><strong>{paymentLabels[order.paymentMethod] || order.paymentMethod}</strong></span>
                <span className="flex justify-between gap-4"><span className="text-white/55">Status financeiro</span><strong>{order.paymentStatus}</strong></span>
                <span className="flex justify-between gap-4"><span className="text-white/55">Estoque</span><strong>{order.stockReducedAt ? "Baixado" : "Pendente"}</strong></span>
              </div>
            </div>
            <select value={order.status} onChange={(event) => updateOrder(order, { status: event.target.value })} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input
              defaultValue={order.trackingCode}
              onBlur={(event) => updateOrder(order, { trackingCode: event.target.value })}
              className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35"
              placeholder="Código de rastreio"
            />
            {order.customerPhone ? (
              <a href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gold/20 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-gold hover:text-gold">
                <MessageCircle className="h-4 w-4" /> Contato
              </a>
            ) : null}
          </aside>
        </article>
      ))}
      {!filteredOrders.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhum pedido encontrado.</p> : null}
    </section>
  );
}
