"use client";

import { useMemo, useState } from "react";
import { Mail, MessageCircle, Search } from "lucide-react";
import type { AdminCustomer } from "@/lib/admin-data";

export function AdminCustomersManager({ customers }: { customers: AdminCustomer[] }) {
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers.filter((customer) =>
      !normalized ||
      [customer.name, customer.email, customer.phone, customer.document].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [customers, query]);

  return (
    <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
      <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Relacionamento</p>
          <h1 className="mt-2 text-2xl font-black text-white">Clientes da loja</h1>
        </div>
        <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">
          {customers.length} clientes
        </span>
      </div>
      <div className="border-b border-gold/15 bg-black/35 p-4">
        <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar cliente, e-mail, telefone ou documento" />
        </label>
      </div>
      <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-[1.2fr_1.3fr_1fr_.7fr_.7fr]">
        <span>Cliente</span>
        <span>E-mail</span>
        <span>Telefone</span>
        <span>Pedidos</span>
        <span className="text-right">Contato</span>
      </div>
      {filteredCustomers.map((customer) => (
        <div key={customer.id} className="grid gap-4 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-[1.2fr_1.3fr_1fr_.7fr_.7fr] md:items-center">
          <div>
            <strong>{customer.name}</strong>
            <p className="mt-1 text-xs text-white/45">{new Date(customer.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
          <span className="text-white/70">{customer.email}</span>
          <span className="text-white/70">{customer.phone || "Não informado"}</span>
          <strong className="text-gold">{customer.orders}</strong>
          <div className="flex justify-end gap-2">
            <a href={`mailto:${customer.email}`} className="grid h-10 w-10 place-items-center rounded-full border border-gold/20 text-white transition hover:border-gold hover:text-gold" aria-label="Enviar e-mail">
              <Mail className="h-4 w-4" />
            </a>
            {customer.phone ? (
              <a href={`https://wa.me/55${customer.phone.replace(/\D/g, "")}`} target="_blank" className="grid h-10 w-10 place-items-center rounded-full border border-gold/20 text-white transition hover:border-gold hover:text-gold" aria-label="Chamar no WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      ))}
      {!filteredCustomers.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhum cliente encontrado.</p> : null}
    </section>
  );
}
