"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/commerce/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <section className="arabic-pattern bg-black pb-20 pt-28 text-white sm:pt-32">
      <div className="container">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Sacola ZION</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Carrinho</h1>
        <div className="mt-8 grid min-w-0 gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-4">
            {items.length === 0 ? (
              <div className="border border-gold/20 bg-white/[0.035] p-6 text-center sm:p-10">
                <p className="font-display text-3xl">Sua sacola está vazia</p>
                <p className="mx-auto mt-3 max-w-md text-white/55">Escolha uma fragrância árabe premium para começar sua curadoria.</p>
                <Link href="/produtos" className="mt-6 inline-flex w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Ver produtos</Button>
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.slug} className="grid min-w-0 gap-4 border border-gold/18 bg-white/[0.03] p-4 md:grid-cols-[120px_minmax(0,1fr)_auto]">
                  <div className="relative aspect-square overflow-hidden border border-gold/20 bg-black">
                    <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover opacity-80" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words font-display text-2xl">{item.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">{item.shortDescription}</p>
                    <button onClick={() => removeItem(item.slug)} className="mt-4 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-gold">
                      <Trash2 className="h-4 w-4" /> Remover
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-5 md:flex-col md:items-end">
                    <p className="shrink-0 font-semibold text-gold">{formatCurrency((item.salePrice ?? item.price) * item.quantity)}</p>
                    <div className="inline-flex shrink-0 items-center rounded-full border border-gold/20">
                      <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity - 1)} aria-label="Diminuir quantidade"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity + 1)} aria-label="Aumentar quantidade"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <aside className="h-max border border-gold/20 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-3xl">Resumo</h2>
            <div className="luxury-divider my-6" />
            <div className="grid gap-3 text-sm text-white/65">
              <div className="flex justify-between gap-4"><span>Subtotal</span><strong className="text-white">{formatCurrency(subtotal)}</strong></div>
              <div className="flex justify-between gap-4"><span>Frete estimado</span><strong className="text-white">{subtotal > 0 ? formatCurrency(29.9) : formatCurrency(0)}</strong></div>
            </div>
            <Link href="/checkout" className="mt-6 block"><Button className="w-full" disabled={!items.length}>Finalizar compra</Button></Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
