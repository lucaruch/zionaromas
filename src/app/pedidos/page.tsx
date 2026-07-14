import { orderStatuses } from "@/lib/data";

const orders = [
  { code: "ZA-1029", total: "R$ 579,80", status: "Enviado", date: "12/07/2026" },
  { code: "ZA-1018", total: "R$ 249,90", status: "Entregue", date: "28/06/2026" }
];

export default function OrdersPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <h1 className="font-display text-5xl">Meus pedidos</h1>
        <div className="mt-10 grid gap-5">
          {orders.map((order) => (
            <article key={order.code} className="rounded-lg border border-black/10 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-2xl">{order.code}</h2>
                  <p className="mt-1 text-sm text-black/50">{order.date} • {order.total}</p>
                </div>
                <span className="rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-deep">{order.status}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-6">
                {orderStatuses.map((status) => (
                  <span key={status} className={`rounded-full px-3 py-2 text-center text-xs ${status === order.status ? "bg-black text-white" : "bg-pearl text-black/50"}`}>
                    {status}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
