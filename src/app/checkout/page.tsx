"use client";

import { CreditCard, Landmark, Loader2, QrCode, Truck, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/commerce/cart-provider";
import { formatCurrency } from "@/lib/utils";

type ShippingOption = {
  id: number;
  name: string;
  company: string;
  price: number;
  deliveryTime: number;
  source: string;
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const discount = useMemo(() => (subtotal > 400 ? 35 : 0), [subtotal]);
  const selectedShipping = shippingOptions.find((option) => option.id === selectedShippingId);
  const shipping = selectedShipping?.price ?? 0;
  const total = subtotal + shipping - discount;

  async function quoteShipping(postalCode: string) {
    setShippingLoading(true);
    setShippingMessage("");

    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode,
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity }))
        })
      });
      const data = await response.json();
      const options = (data.options || []) as ShippingOption[];
      setShippingOptions(options);
      setSelectedShippingId(options[0]?.id ?? null);
      setShippingMessage(data.warning || (response.ok ? "" : "Usando frete de contingência."));
    } catch {
      setShippingMessage("Não foi possível consultar o frete agora.");
      setShippingOptions([]);
      setSelectedShippingId(null);
    } finally {
      setShippingLoading(false);
    }
  }

  async function lookupCep(value: string) {
    const clean = value.replace(/\D/g, "");
    setCep(value);
    setShippingOptions([]);
    setSelectedShippingId(null);

    if (clean.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await response.json();
        if (!data.erro) setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
      } catch {
        setAddress("Endereço será confirmado no processamento do pedido.");
      }

      if (items.length) {
        await quoteShipping(clean);
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
              <div className="mt-5 rounded-lg border border-black/10 bg-pearl p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4 text-gold-deep" />
                  Frete Correios via Melhor Envio
                </div>
                {shippingLoading ? (
                  <p className="inline-flex items-center gap-2 text-sm text-black/55">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculando PAC e SEDEX...
                  </p>
                ) : shippingOptions.length ? (
                  <div className="grid gap-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-black/10 bg-white p-3 text-sm transition hover:border-gold"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            name="shipping"
                            type="radio"
                            checked={selectedShippingId === option.id}
                            onChange={() => setSelectedShippingId(option.id)}
                            className="accent-gold"
                          />
                          <span>
                            <strong>{option.name}</strong>
                            <span className="block text-xs text-black/50">
                              {option.company} • {option.deliveryTime} dias úteis
                            </span>
                          </span>
                        </span>
                        <strong>{formatCurrency(option.price)}</strong>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/55">Informe o CEP para calcular PAC e SEDEX.</p>
                )}
                {shippingMessage ? <p className="mt-3 text-xs text-gold-deep">{shippingMessage}</p> : null}
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
                    <span>{label}</span>
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
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <strong className="text-white">{formatCurrency((item.salePrice ?? item.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <Input placeholder="Cupom" className="mt-6 border-white/10 bg-white/10 text-white placeholder:text-white/45" />
            <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <strong>{shipping ? formatCurrency(shipping) : "Calcular"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cupom automático</span>
                <strong>-{formatCurrency(discount)}</strong>
              </div>
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
            <Button className="mt-6 w-full" disabled={!items.length || !selectedShippingId} onClick={clear}>
              Confirmar pedido
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
