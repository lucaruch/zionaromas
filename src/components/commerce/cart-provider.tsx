"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data";

export type CartItem = Product & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("zion-cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zion-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + (item.salePrice ?? item.price) * item.quantity,
      0
    );

    return {
      items,
      open,
      setOpen,
      addItem(product) {
        setItems((current) => {
          const found = current.find((item) => item.slug === product.slug);
          if (found) {
            return current.map((item) =>
              item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...current, { ...product, quantity: 1 }];
        });
        setOpen(true);
      },
      removeItem(slug) {
        setItems((current) => current.filter((item) => item.slug !== slug));
      },
      updateQuantity(slug, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.slug === slug ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        );
      },
      clear() {
        setItems([]);
      },
      count,
      subtotal
    };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
