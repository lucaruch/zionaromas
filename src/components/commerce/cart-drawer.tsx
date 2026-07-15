"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/commerce/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, updateQuantity, removeItem, count } = useCart();

  return (
    <>
      <button
        aria-label="Abrir carrinho"
        onClick={() => setOpen(true)}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:border-gold hover:text-gold"
      >
        <ShoppingBag className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-black">
            {count}
          </span>
        ) : null}
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              aria-label="Fechar carrinho"
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-gold/20 bg-black text-white shadow-[0_28px_90px_rgba(0,0,0,.65)] sm:w-[min(92vw,28rem)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="flex items-center justify-between border-b border-gold/15 p-4 sm:p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gold">Sua seleção</p>
                  <h2 className="font-display text-2xl">Sacola</h2>
                </div>
                <button className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-gold" onClick={() => setOpen(false)} aria-label="Fechar carrinho">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
                {items.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-gold" />
                      <p className="font-display text-2xl">Nenhuma fragrância selecionada</p>
                      <p className="mt-2 text-sm text-white/55">Adicione um perfume para continuar a compra.</p>
                    </div>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.slug} className="flex min-w-0 gap-3 border-b border-gold/15 pb-5 sm:gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-gold/20 bg-black">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover opacity-80" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex min-w-0 justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 font-medium">{item.name}</h3>
                            <p className="text-sm text-white/50">{item.volume}</p>
                          </div>
                          <button onClick={() => removeItem(item.slug)} className="shrink-0 text-white/40 hover:text-gold" aria-label={`Remover ${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:mt-auto">
                          <div className="inline-flex items-center rounded-full border border-gold/20">
                            <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity - 1)} aria-label="Diminuir quantidade">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity + 1)} aria-label="Aumentar quantidade">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-semibold text-gold">{formatCurrency((item.salePrice ?? item.price) * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gold/15 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between text-lg">
                  <span className="text-white/70">Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  <Button className="w-full" disabled={!items.length}>Finalizar compra</Button>
                </Link>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
