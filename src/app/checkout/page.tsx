"use client";

import { CheckCircle2, CreditCard, Landmark, Loader2, QrCode, Truck, type LucideIcon } from "lucide-react";
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
  redirectUrl?: string;
};

const paymentIcons: Record<PaymentMethod, LucideIcon> = {
  PIX: QrCode,
  CARTAO_CREDITO: CreditCard,
  CARTAO_DEBITO: Landmark
};

const defaultPickupOption: ShippingOption = {
  id: 900,
  name: "Retirada na Loja (Grátis)",
  company: "ZION AROMAS",
  price: 0,
  deliveryTime: 0,
  source: "pickup"
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
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([defaultPickupOption]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(900);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<CheckoutPaymentSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [paymentResult, setPaymentResult] = useState<CheckoutPaymentResult | null>(null);
  const [orderCode, setOrderCode] = useState("");
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiration, setCardExpiration] = useState("");
  const [cardSecurityCode, setCardSecurityCode] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardInstallments, setCardInstallments] = useState(1);
  const pixDiscount = useMemo(() => (paymentMethod === "PIX" ? subtotal * 0.10 : 0), [paymentMethod, subtotal]);
  const automaticDiscount = useMemo(() => (subtotal > 400 ? 35 : 0), [subtotal]);
  const discount = automaticDiscount + pixDiscount;
  const selectedShipping = shippingOptions.find((option) => option.id === selectedShippingId);
  const shipping = selectedShipping?.price ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const isCardPayment = paymentMethod === "CARTAO_CREDITO" || paymentMethod === "CARTAO_DEBITO";

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
            methods: [{ id: "PIX", label: "PIX (10% OFF)", description: "Pagamento seguro via PIX com 10% de desconto." }]
          });
        }
      }
    }

    loadPaymentSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedCode = window.sessionStorage.getItem("zion-last-order") || "";
    const fromAuth = params.get("pagamento") === "autenticado";
    if (fromAuth && storedCode) {
      setOrderCode(storedCode);
      setCheckoutMessage(`Pedido ${storedCode} recebido. Confirmando autenticação do pagamento...`);
    }
  }, []);
  useEffect(() => {
    if (!orderCode || paymentApproved) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function checkStatus() {
      try {
        const response = await fetch(`/api/checkout/status?orderCode=${encodeURIComponent(orderCode)}`, {
          cache: "no-store"
        });
        const data = await response.json();
        if (cancelled || !response.ok) return;

        if (data.approved) {
          setPaymentApproved(true);
          setCheckoutMessage(`Pedido ${orderCode}: ${data.message}`);
          setPaymentResult((current) =>
            current
              ? { ...current, status: "ready", message: data.message }
              : {
                  method: paymentMethod,
                  provider: paymentSettings?.providerName || "ZION AROMAS",
                  status: "ready",
                  message: data.message
                }
          );
          clear();
          return;
        }
      } catch {
        // Mantém polling silencioso.
      }

      if (!cancelled) {
        timer = setTimeout(checkStatus, 4000);
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [clear, orderCode, paymentApproved, paymentMethod, paymentSettings?.providerName]);

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
      const rawOptions = (data.options || []) as ShippingOption[];
      const hasPickup = rawOptions.some((opt) => opt.id === 900);
      const options = hasPickup ? rawOptions : [defaultPickupOption, ...rawOptions];

      setShippingOptions(options);
      setSelectedShippingId((prev) => (prev !== null && options.some((opt) => opt.id === prev) ? prev : options[0]?.id ?? 900));
      setShippingMessage(data.warning || (response.ok ? "" : "Usando frete de contingência."));
    } catch {
      setShippingMessage("Não foi possível consultar o frete dos Correios agora.");
      setShippingOptions([defaultPickupOption]);
      setSelectedShippingId(900);
    } finally {
      setShippingLoading(false);
    }
  }

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

      if (items.length) {
        await quoteShipping(clean);
      }
    }
  }

  async function finishOrder() {
    setCheckoutMessage("");
    setPaymentResult(null);
    setPaymentApproved(false);
    setOrderCode("");

    if (!items.length) {
      setCheckoutMessage("Seu carrinho está vazio.");
      return;
    }

    const isPickup = selectedShippingId === 900;
    if (!name || !email) {
      setCheckoutMessage("Preencha seu nome e e-mail.");
      return;
    }

    if (!isPickup && (cep.replace(/\D/g, "").length !== 8 || !address || !number)) {
      setCheckoutMessage("Preencha seus dados de endereço para entrega.");
      return;
    }

    if (isCardPayment && (!cardNumber || !cardHolder || !cardExpiration || !cardSecurityCode)) {
      setCheckoutMessage("Preencha os dados do cartão para continuar.");
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
            postalCode: cep.replace(/\D/g, "").length === 8 ? cep : "11700-007",
            street: isPickup ? (address || "Retirada na Loja ZION AROMAS") : address,
            number: isPickup ? (number || "S/N") : number,
            complement
          },
          items: items.map((item) => ({ productId: item.slug, quantity: item.quantity })),
          paymentMethod,
          card: isCardPayment
            ? {
                cardNumber,
                holder: cardHolder,
                expirationDate: cardExpiration,
                securityCode: cardSecurityCode,
                brand: cardBrand,
                installments: paymentMethod === "CARTAO_CREDITO" ? cardInstallments : 1
              }
            : undefined,
          coupon,
          shipping
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setCheckoutMessage(data.error || "Não foi possível finalizar o pedido agora.");
        return;
      }

      const payment = data.payment || null;
      const approved = data.paymentStatus === "aprovado" || /aprovado/i.test(String(data.nextStep || ""));
      setOrderCode(data.orderCode || "");
      if (typeof window !== "undefined" && data.orderCode) {
        window.sessionStorage.setItem("zion-last-order", data.orderCode);
      }
      if (!(isCardPayment && payment?.status === "manual")) clear();
      setPaymentApproved(approved);
      setPaymentResult(payment);
      setCheckoutMessage(
        approved
          ? `Pedido ${data.orderCode}: Pagamento aprovado! Seu pedido já está sendo preparado.`
          : `Pedido ${data.orderCode} recebido. ${data.nextStep}`
      );

      if (payment?.redirectUrl) {
        window.location.href = payment.redirectUrl;
      }
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
              {isCardPayment ? (
                <div className="mt-5 grid gap-4 border border-gold/18 bg-black/35 p-4 md:grid-cols-2">
                  <Input placeholder="Número do cartão" inputMode="numeric" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
                  <Input placeholder="Nome impresso no cartão" value={cardHolder} onChange={(event) => setCardHolder(event.target.value)} />
                  <Input placeholder="Validade MM/AAAA" value={cardExpiration} onChange={(event) => setCardExpiration(event.target.value)} />
                  <Input placeholder="CVV" inputMode="numeric" value={cardSecurityCode} onChange={(event) => setCardSecurityCode(event.target.value)} />
                  <select value={cardBrand} onChange={(event) => setCardBrand(event.target.value)} className="h-12 border border-gold/18 bg-black px-4 text-sm text-white outline-none transition focus:border-gold">
                    <option value="Visa">Visa</option>
                    <option value="Master">Mastercard</option>
                    <option value="Amex">American Express</option>
                    <option value="Elo">Elo</option>
                    <option value="Hipercard">Hipercard</option>
                  </select>
                  {paymentMethod === "CARTAO_CREDITO" ? (
                    <select value={cardInstallments} onChange={(event) => setCardInstallments(Number(event.target.value))} className="h-12 border border-gold/18 bg-black px-4 text-sm text-white outline-none transition focus:border-gold">
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((installment) => (
                        <option key={installment} value={installment}>
                          {installment}x de {formatCurrency(total / installment)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="flex min-h-12 items-center border border-gold/18 px-4 text-sm text-white/60">
                      Débito pode exigir autenticação do banco emissor.
                    </p>
                  )}
                </div>
              ) : null}
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
            {checkoutMessage ? (
              <p className={`mt-4 text-sm leading-6 ${paymentApproved ? "text-emerald-300" : "text-gold"}`}>
                {checkoutMessage}
              </p>
            ) : null}
            {paymentApproved ? (
              <div className="mt-5 border border-emerald-400/35 bg-emerald-400/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">
                      Pagamento aprovado
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {orderCode ? `Pedido ${orderCode} confirmado. ` : ""}
                      Já recebemos o pagamento e vamos seguir com a separação do seu pedido.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            {paymentResult && !paymentApproved ? (
              <div className="mt-5 border border-gold/18 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">
                  {paymentResult.provider}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">{paymentResult.message}</p>
                {paymentResult.pixQrCodeImage || paymentResult.pixQrCode ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/55">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Aguardando confirmação do pagamento...
                  </p>
                ) : null}
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
                {paymentResult.redirectUrl ? (
                  <a href={paymentResult.redirectUrl} className="mt-4 inline-flex w-full justify-center rounded-full bg-gold-metal px-5 py-3 text-sm font-bold text-black">
                    Continuar autenticação do banco
                  </a>
                ) : null}
              </div>
            ) : null}
            <Button className="mt-6 w-full" type="button" disabled={!items.length || !selectedShippingId || checkoutLoading || paymentApproved} onClick={finishOrder}>
              {checkoutLoading ? "Finalizando..." : paymentApproved ? "Pedido confirmado" : "Finalizar pedido"}
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
