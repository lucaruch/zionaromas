"use client";

import { CreditCard, Landmark, Loader2, QrCode, Truck, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/commerce/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type PaymentMethod } from "@/lib/payments";
import { formatCurrency } from "@/lib/utils";

type ShippingOption = {
  id: number;
  name: string;
  company: string;
  price: number;
  deliveryTime: number;
  source: string;
};

type PaymentOption = {
  id: PaymentMethod;
  label: string;
  description: string;
};

type CheckoutPaymentSettings = {
  providerName: string;
  methods: PaymentOption[];
};

type CheckoutPaymentResult = {
  method: PaymentMethod;
  provider: string;
  status: "pending" | "ready" | "manual";
  message: string;
  pixQrCode?: string;
  pixQrCodeImage?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
};

const paymentIcons: Record<PaymentMethod, LucideIcon> = {
  PIX: QrCode,
  CARTAO: CreditCard,
  BOLETO: Landmark
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [coupon, setCoupon] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<CheckoutPaymentSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [paymentResult, setPaymentResult] = useState<CheckoutPaymentResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const discount = useMemo(() => (subtotal > 400 ? 35 : 0), [subtotal]);
  const selectedShipping = shippingOptions.find((option) => option.id === selectedShippingId);
  const shipping = selectedShipping?.price ?? 0;
  const total = subtotal + shipping - discount;

  useEffect(() => {
    let mounted = true;

    async function loadPaymentSettings() {
      try {
        const response = await fetch("/api/payment-settings", { cache: "no-store" });
        const data = (await response.json()) as CheckoutPaymentSettings;
        if (!mounted) return;

        setPaymentSettings(data);
        if (data.methods[0]?.id) {
          setPaymentMethod(data.methods[0].id);
        }
      } catch {
        if (mounted) {
          setPaymentSettings({
            providerName: "ZION AROMAS",
            methods: [{ id: "PIX", label: "PIX", description: "Pagamento seguro via PIX." }]
          });
        }
      }
    }

    loadPaymentSettings();
    return () => {
      mounted = false;
    };
  }, []);

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

  async function finishOrder() {
    setCheckoutMessage("");
    setPaymentResult(null);

    if (!items.length) {
      setCheckoutMessage("Seu carrinho está vazio.");
      return;
    }

    if (!name || !email || cep.replace(/\D/g, "").length !== 8 || !address || !number) {
      setCheckoutMessage("Preencha seus dados e confirme o endereço de entrega.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone, document },
          address: {
            postalCode: cep,
            street: address,
            number,
            complement
          },
          items: items.map((item) => ({ productId: item.slug, quantity: item.quantity })),
          paymentMethod,
          coupon,
          shipping
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setCheckoutMessage(data.error || "Não foi possível finalizar o pedido agora.");
        return;
      }

      clear();
      setPaymentResult(data.payment || null);
      setCheckoutMessage(`Pedido ${data.orderCode} recebido. ${data.nextStep}`);
    } catch {
      setCheckoutMessage("Não foi possível finalizar o pedido agora.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <section className="arabic-pattern bg-black pb-20 pt-28 text-white sm:pt-32">
      <div className="container">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Finalização segura</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Concluir pedido</h1>
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form className="grid min-w-0 gap-6 sm:gap-8">
            <div className="border border-gold/18 bg-white/[0.03] p-4 sm:p-6">
              <h2 className="font-display text-3xl">Seus dados</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input placeholder="Nome completo" value={name} onChange={(event) => setName(event.target.value)} />
                <Input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Input placeholder="Telefone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                <Input placeholder="CPF ou CNPJ" value={document} onChange={(event) => setDocument(event.target.value)} />
              </div>
            </div>

            <div className="border border-gold/18 bg-white/[0.03] p-4 sm:p-6">
              <h2 className="font-display text-3xl">Entrega</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                <Input placeholder="CEP" value={cep} onChange={(event) => lookupCep(event.target.value)} />
                <Input placeholder="Endereço localizado pelo CEP" value={address} onChange={(event) => setAddress(event.target.value)} />
                <Input placeholder="Número" value={number} onChange={(event) => setNumber(event.target.value)} />
                <Input placeholder="Complemento" value={complement} onChange={(event) => setComplement(event.target.value)} />
              </div>
              <div className="mt-5 border border-gold/20 bg-black/45 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold">
                  <Truck className="h-4 w-4" />
                  Entrega pelos Correios
                </div>
                {shippingLoading ? (
                  <p className="inline-flex items-center gap-2 text-sm text-white/55">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Consultando opções disponíveis...
                  </p>
                ) : shippingOptions.length ? (
                  <div className="grid gap-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer flex-col gap-3 border border-gold/15 bg-white/[0.035] p-3 text-sm transition hover:border-gold sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <input
                            name="shipping"
                            type="radio"
                            checked={selectedShippingId === option.id}
                            onChange={() => setSelectedShippingId(option.id)}
                            className="accent-gold"
                          />
                          <span className="min-w-0">
                            <strong>{option.name}</strong>
                            <span className="block text-xs text-white/50">
                              {option.source === "pickup"
                                ? "Retirada conforme atendimento da loja"
                                : `${option.company} - ${option.deliveryTime} dias úteis`}
                            </span>
                          </span>
                        </span>
                        <strong className="shrink-0 text-gold">{formatCurrency(option.price)}</strong>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/55">Informe o CEP para visualizar prazo e valor de entrega.</p>
                )}
                {shippingMessage ? <p className="mt-3 text-xs text-gold">{shippingMessage}</p> : null}
              </div>
            </div>

            <div className="border border-gold/18 bg-white/[0.03] p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl">Pagamento</h2>
                  <p className="mt-2 text-sm text-white/55">
                    {paymentSettings ? `Processamento seguro por ${paymentSettings.providerName}.` : "Carregando formas de pagamento..."}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {(paymentSettings?.methods || []).map((option) => {
                  const Icon = paymentIcons[option.id];

                  return (
                    <label key={option.id} className="flex cursor-pointer items-center gap-3 border border-gold/18 bg-black/35 p-4 transition hover:border-gold">
                      <input
                        name="payment"
                        type="radio"
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                        className="accent-gold"
                      />
                      <Icon className="h-5 w-5 text-gold" />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>

          <aside className="h-max border border-gold/25 bg-black p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,.45)] sm:p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-3xl">Resumo da compra</h2>
            <div className="mt-6 grid gap-4">
              {items.map((item) => (
                <div key={item.slug} className="flex min-w-0 justify-between gap-3 text-sm text-white/70">
                  <span className="min-w-0 break-words">
                    {item.quantity}x {item.name}
                  </span>
                  <strong className="shrink-0 text-white">{formatCurrency((item.salePrice ?? item.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <Input placeholder="Cupom de desconto" className="mt-6" value={coupon} onChange={(event) => setCoupon(event.target.value)} />
            <div className="mt-6 grid gap-3 border-t border-gold/15 pt-6 text-sm text-white/70">
              <div className="flex justify-between gap-4">
                <span>Subtotal</span>
                <strong className="text-white">{formatCurrency(subtotal)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Frete</span>
                <strong className="text-white">{selectedShipping ? formatCurrency(shipping) : "Calcular"}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Desconto aplicado</span>
                <strong className="text-gold">-{formatCurrency(discount)}</strong>
              </div>
              <div className="flex justify-between gap-4 text-lg text-white">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
            {checkoutMessage ? <p className="mt-4 text-sm leading-6 text-gold">{checkoutMessage}</p> : null}
            {paymentResult ? (
              <div className="mt-5 border border-gold/18 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">
                  {paymentResult.provider}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">{paymentResult.message}</p>
                {paymentResult.pixQrCodeImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- QR Code comes from a generated data URI.
                  <img src={paymentResult.pixQrCodeImage} alt="QR Code PIX" className="mt-4 aspect-square w-full bg-white object-contain p-3" />
                ) : null}
                {paymentResult.pixQrCode ? (
                  <div className="mt-4 grid gap-3">
                    <textarea
                      readOnly
                      value={paymentResult.pixQrCode}
                      className="min-h-28 resize-none rounded-md border border-gold/18 bg-black p-3 text-xs text-white outline-none"
                      aria-label="PIX copia e cola"
                    />
                    <Button type="button" onClick={() => navigator.clipboard.writeText(paymentResult.pixQrCode || "")}>
                      Copiar PIX copia e cola
                    </Button>
                  </div>
                ) : null}
                {paymentResult.boletoUrl ? (
                  <a href={paymentResult.boletoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-gold underline">
                    Abrir boleto
                  </a>
                ) : null}
              </div>
            ) : null}
            <Button className="mt-6 w-full" type="button" disabled={!items.length || !selectedShippingId || checkoutLoading} onClick={finishOrder}>
              {checkoutLoading ? "Finalizando..." : "Finalizar pedido"}
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
