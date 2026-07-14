"use client";

import { CreditCard, Landmark, QrCode, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/commerce/cart-provider";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const shipping = subtotal > 0 ? 29.9 : 0;
  const discount = useMemo(() => (subtotal > 400 ? 35 : 0), [subtotal]);
  const total = subtotal + shipping - discount;

  async function lookupCep(value: string) {
    const clean = value.replace(/\D/g, "");
    setCep(value);
    if (clean.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await response.json();
        if (!data.erro) setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
      } catch {
        setAddress("Endereço será confirmado no processamento do pedido.");
      }
    }
  }

  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <h1 className="font-display text-5xl">Checkout</h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form className="grid gap-8">
            <div className="rounded-lg border border-black/10 p-6">
              <h2 className="font-display text-3xl">Identificação</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input placeholder="Nome completo" />
                <Input placeholder="E-mail" type="email" />
                <Input placeholder="Telefone" />
                <Input placeholder="CPF/CNPJ" />
              </div>
            </div>
            <div className="rounded-lg border border-black/10 p-6">
              <h2 className="font-display text-3xl">Entrega</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                <Input placeholder="CEP" value={cep} onChange={(event) => lookupCep(event.target.value)} />
                <Input placeholder="Endereço automático" value={address} onChange={(event) => setAddress(event.target.value)} />
                <Input placeholder="Número" />
                <Input placeholder="Complemento" />
              </div>
            </div>
            <div className="rounded-lg border border-black/10 p-6">
              <h2 className="font-display text-3xl">Pagamento</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {([
                  ["PIX", QrCode],
                  ["Cartão", CreditCard],
                  ["Boleto", Landmark]
                ] as [string, LucideIcon][]).map(([label, Icon]) => (
                  <label key={label} className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/10 p-4 hover:border-gold">
                    <input name="payment" type="radio" defaultChecked={label === "PIX"} className="accent-gold" />
                    <Icon className="h-5 w-5 text-gold-deep" />
                    <span>{String(label)}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
          <aside className="h-max rounded-lg border border-black/10 bg-black p-6 text-white">
            <h2 className="font-display text-3xl">Resumo do pedido</h2>
            <div className="mt-6 grid gap-4">
              {items.map((item) => (
                <div key={item.slug} className="flex justify-between gap-3 text-sm text-white/70">
                  <span>{item.quantity}x {item.name}</span>
                  <strong className="text-white">{formatCurrency((item.salePrice ?? item.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <Input placeholder="Cupom" className="mt-6 border-white/10 bg-white/10 text-white placeholder:text-white/45" />
            <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div className="flex justify-between"><span>Frete</span><strong>{formatCurrency(shipping)}</strong></div>
              <div className="flex justify-between"><span>Cupom automático</span><strong>-{formatCurrency(discount)}</strong></div>
              <div className="flex justify-between text-lg"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            </div>
            <Button className="mt-6 w-full" disabled={!items.length} onClick={clear}>Confirmar pedido</Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
