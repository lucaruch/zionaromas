import { MessageCircle, Search } from "lucide-react";

const orders = [
  { id: "#ZA-1048", date: "01 de jul., 13:42", customer: "Mariana Souza", items: "2 itens", total: "R$ 319,80", delivery: "Retirada na loja", status: "Cancelado" },
  { id: "#ZA-1047", date: "01 de jul., 11:18", customer: "Rafael Oliveira", items: "1 item", total: "R$ 249,90", delivery: "Entrega a combinar", status: "Concluído" },
  { id: "#ZA-1046", date: "30 de jun., 17:05", customer: "Camila Santos", items: "3 itens", total: "R$ 389,70", delivery: "Retirada na loja", status: "Concluído" }
];

export default function AdminOrdersPage() {
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
          <input className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar por cliente ou número" />
        </label>
        <select className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
          <option>Todos</option>
          <option>Recebido</option>
          <option>Pago</option>
          <option>Separação</option>
          <option>Enviado</option>
          <option>Entregue</option>
          <option>Cancelado</option>
        </select>
      </div>
      <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-[1.25fr_1.25fr_.9fr_1.2fr_1.15fr_.45fr]">
        <span>Pedido</span>
        <span>Cliente</span>
        <span>Total</span>
        <span>Entrega</span>
        <span>Status</span>
        <span className="text-right">Contato</span>
      </div>
      {orders.map((order) => (
        <div key={order.id} className="grid gap-4 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-[1.25fr_1.25fr_.9fr_1.2fr_1.15fr_.45fr] md:items-center">
          <div>
            <strong>{order.id}</strong>
            <p className="mt-1 text-xs text-white/45">{order.date}</p>
          </div>
          <div>
            <strong>{order.customer}</strong>
            <p className="mt-1 text-xs text-white/45">{order.items}</p>
          </div>
          <strong className="text-gold">{order.total}</strong>
          <span className="text-white/70">{order.delivery}</span>
          <select defaultValue={order.status} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
            {["Recebido", "Pago", "Separação", "Enviado", "Entregue", "Concluído", "Cancelado"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-gold/20 text-white transition hover:border-gold hover:text-gold" aria-label="Contato do pedido">
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      ))}
    </section>
  );
}
