"use client";

import { useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const coupons = [
  { code: "ZION35", discount: "R$ 35", validity: "31/08/2026", status: "Ativo" },
  { code: "ROYAL10", discount: "10%", validity: "15/09/2026", status: "Ativo" }
];

export default function AdminCouponsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Campanha promocional</p>
            <h1 className="mt-2 text-2xl font-black text-white">Cupons da loja</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">
              {coupons.length} cupons
            </span>
            <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Criar cupom</Button>
          </div>
        </div>

        <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_200px]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
            <Search className="h-4 w-4" />
            <input className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar por código" />
          </label>
          <select className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
            <option>Todos</option>
            <option>Ativos</option>
            <option>Expirados</option>
          </select>
        </div>

        <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-4">
          <span>Código</span>
          <span>Desconto</span>
          <span>Validade</span>
          <span>Status</span>
        </div>
        {coupons.map((coupon) => (
          <div key={coupon.code} className="grid border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-4">
            <strong>{coupon.code}</strong>
            <span className="text-gold">{coupon.discount}</span>
            <span className="text-white/70">{coupon.validity}</span>
            <span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-[10px] font-black uppercase text-emerald-300">{coupon.status}</span></span>
          </div>
        ))}
      </section>

      {modalOpen ? <CouponModal onClose={() => setModalOpen(false)} /> : null}
    </div>
  );
}

function CouponModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur">
      <form className="w-full max-w-lg border border-gold/25 bg-[#070604] text-white shadow-[0_28px_90px_rgba(0,0,0,.75)]">
        <div className="flex items-center justify-between border-b border-gold/15 bg-black px-5 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Campanha promocional</p>
            <h2 className="mt-1 text-2xl font-black">Novo cupom</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-white hover:border-gold hover:text-gold">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/65">
            Código do cupom
            <input placeholder="EX.: ZION10" className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/65">
              Tipo de desconto
              <select className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm font-semibold text-white outline-none focus:border-gold">
                <option>Porcentagem</option>
                <option>Valor fixo</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/65">
              Desconto
              <input className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm text-white outline-none focus:border-gold" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/65">
              Compra mínima
              <input defaultValue="0,00" className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm text-white outline-none focus:border-gold" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/65">
              Validade
              <input defaultValue="31/12/2026" className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm text-white outline-none focus:border-gold" />
            </label>
          </div>
          <label className="flex items-center justify-between border border-gold/18 bg-black p-4 text-sm">
            <span><strong>Cupom ativo</strong><small className="mt-1 block text-white/45">Disponível para aplicação no checkout</small></span>
            <input type="checkbox" defaultChecked className="accent-gold" />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-gold/15 bg-black p-5">
          <button type="button" onClick={onClose} className="h-11 rounded-full border border-gold/25 px-6 text-[10px] font-black uppercase tracking-[0.14em] text-white hover:border-gold">
            Cancelar
          </button>
          <Button type="submit"><Check className="h-4 w-4" /> Criar cupom</Button>
        </div>
      </form>
    </div>
  );
}
