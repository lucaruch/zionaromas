"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/commerce/cart-provider";

export function AddToCart({ product, label = "Adicionar ao carrinho" }: { product: Product; label?: string }) {
  const { addItem } = useCart();

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Button onClick={() => addItem(product)} className="w-full">
        <ShoppingBag className="h-4 w-4" />
        {label}
      </Button>
    </motion.div>
  );
}
