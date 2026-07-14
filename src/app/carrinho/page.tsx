"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/commerce/cart-provider";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Sacola ZION</p>
        <h1 className="mt-3 font-display text-5xl">Carrinho</h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {items.length === 0 ? (
              <div className="border border-gold/20 bg-white/[0.035] p-10 text-center">
                <p className="font-display text-3xl">Sua sacola está vazia</p>
                <p className="mx-auto mt-3 max-w-md text-white/55">Escolha uma fragrância árabe premium para começar sua curadoria.</p>
                <Link href="/produtos" className="mt-6 inline-flex"><Button>Ver produtos</Button></Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.slug} className="grid gap-4 border border-gold/18 bg-white/[0.03] p-4 md:grid-cols-[120px_1fr_auto]">
                  <div className="relative aspect-square overflow-hidden border border-gold/20 bg-black">
                    <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover opacity-80" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">{item.name}</h2>
                    <p className="mt-2 text-sm text-white/55">{item.shortDescription}</p>
                    <button onClick={() => removeItem(item.slug)} className="mt-4 inline-flex items-center gap-2 text-sm text-white/45 hover:text-gold">
                      <Trash2 className="h-4 w-4" /> Remover
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-5 md:flex-col md:items-end">
                    <p className="font-semibold text-gold">{formatCurrency((item.salePrice ?? item.price) * item.quantity)}</p>
                    <div className="inline-flex items-center rounded-full border border-gold/20">
                      <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity - 1)}><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity + 1)}><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <aside className="h-max border border-gold/20 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)]">
            <h2 className="font-display text-3xl">Resumo</h2>
            <div className="luxury-divider my-6" />
            <div className="grid gap-3 text-sm text-white/65">
              <div className="flex justify-between"><span>Subtotal</span><strong className="text-white">{formatCurrency(subtotal)}</strong></div>
              <div className="flex justify-between"><span>Frete estimado</span><strong className="text-white">{subtotal > 0 ? formatCurrency(29.9) : formatCurrency(0)}</strong></div>
            </div>
            <Link href="/checkout" className="mt-6 block"><Button className="w-full" disabled={!items.length}>Finalizar compra</Button></Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
