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
              className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-gold/20 bg-black text-white shadow-[0_28px_90px_rgba(0,0,0,.65)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="flex items-center justify-between border-b border-gold/15 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gold">Sacola ZION</p>
                  <h2 className="font-display text-2xl">Carrinho</h2>
                </div>
                <button className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-gold" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {items.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-gold" />
                      <p className="font-display text-2xl">Sua sacola está vazia</p>
                      <p className="mt-2 text-sm text-white/55">Escolha uma fragrância para começar.</p>
                    </div>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.slug} className="flex gap-4 border-b border-gold/15 pb-5">
                      <div className="relative h-24 w-20 overflow-hidden border border-gold/20 bg-black">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover opacity-80" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-white/50">{item.volume}</p>
                          </div>
                          <button onClick={() => removeItem(item.slug)} className="text-white/40 hover:text-gold">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-gold/20">
                            <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button className="p-2" onClick={() => updateQuantity(item.slug, item.quantity + 1)}>
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
              <div className="border-t border-gold/15 p-5">
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
