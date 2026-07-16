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
        [order.code, order.customerName, order.customerEmail].some((value) => value.toLowerCase().includes(normalized));
      const matchesStatus = status === "all" || order.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  async function updateOrder(order: AdminOrder, patch: Partial<AdminOrder>) {
    setMessage("");
    const response = await fetch("/api/admin/pedidos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: order.id,
        status: patch.status ?? order.status,
        trackingCode: patch.trackingCode ?? order.trackingCode,
        paymentStatus: order.paymentMethod ? "processando" : "pendente"
      })
    });

    if (!response.ok) {
      setMessage("Não foi possível atualizar o pedido.");
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
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar por cliente ou número" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
          <option value="all">Todos</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {message ? <p className="border-b border-gold/10 px-5 py-3 text-sm text-gold">{message}</p> : null}
      <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-[1.2fr_1.3fr_.8fr_1fr_1.15fr_1fr_.45fr]">
        <span>Pedido</span>
        <span>Cliente</span>
        <span>Total</span>
        <span>Pagamento</span>
        <span>Status</span>
        <span>Rastreio</span>
        <span className="text-right">Contato</span>
      </div>
      {filteredOrders.map((order) => (
        <div key={order.id} className="grid gap-4 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-[1.2fr_1.3fr_.8fr_1fr_1.15fr_1fr_.45fr] md:items-center">
          <div>
            <strong>#{order.code}</strong>
            <p className="mt-1 text-xs text-white/45">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
          </div>
          <div>
            <strong>{order.customerName}</strong>
            <p className="mt-1 text-xs text-white/45">{order.items} item(ns)</p>
          </div>
          <strong className="text-gold">{formatCurrency(Number(order.total))}</strong>
          <span className="text-white/70">{order.paymentMethod}</span>
          <select value={order.status} onChange={(event) => updateOrder(order, { status: event.target.value })} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input
            defaultValue={order.trackingCode}
            onBlur={(event) => updateOrder(order, { trackingCode: event.target.value })}
            className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm text-white outline-none placeholder:text-white/35"
            placeholder="Código"
          />
          <a href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`} target="_blank" className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-gold/20 text-white transition hover:border-gold hover:text-gold" aria-label="Contato do pedido">
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      ))}
      {!filteredOrders.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhum pedido encontrado.</p> : null}
    </section>
  );
}
