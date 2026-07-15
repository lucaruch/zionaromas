import { NextResponse } from "next/server";
import { z } from "zod";
import { products } from "@/lib/data";
import { isRateLimited, parseJson } from "@/lib/security";

const quoteSchema = z.object({
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(80),
        quantity: z.number().int().positive().max(20)
      })
    )
    .min(1)
    .max(30)
});

type MelhorEnvioService = {
  id?: number;
  name?: string;
  company?: { name?: string };
  price?: string;
  custom_price?: string;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
};

function cleanPostalCode(value: string) {
  return value.replace(/\D/g, "");
}

function parseWeight(value: string) {
  const numeric = Number(value.replace(/[^\d,.]/g, "").replace(",", "."));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0.4;
}

function fallbackCorreiosQuote() {
  return [
    {
      id: 1,
      name: "PAC",
      company: "Correios",
      price: 29.9,
      deliveryTime: 7,
      source: "fallback"
    },
    {
      id: 2,
      name: "SEDEX",
      company: "Correios",
      price: 44.9,
      deliveryTime: 3,
      source: "fallback"
    }
  ];
}

function melhorEnvioBaseUrl() {
  const fallback = "https://sandbox.melhorenvio.com.br";
  const configured = process.env.MELHOR_ENVIO_BASE_URL || fallback;

  try {
    const url = new URL(configured);
    const allowedHosts = new Set(["sandbox.melhorenvio.com.br", "www.melhorenvio.com.br", "melhorenvio.com.br"]);
    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  if (isRateLimited(request, "shipping-quote", 40, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const parsed = await parseJson(request, quoteSchema, 32_000);

  if (!parsed.ok) {
    return NextResponse.json({ error: "Dados invalidos para cotacao." }, { status: 400 });
  }

  const destinationPostalCode = cleanPostalCode(parsed.data.postalCode);
  const token = process.env.MELHOR_ENVIO_TOKEN;

  if (!token) {
    return NextResponse.json({
      options: fallbackCorreiosQuote(),
      warning: "Configure MELHOR_ENVIO_TOKEN para usar a cotacao real do Melhor Envio."
    });
  }

  const selectedProducts = parsed.data.items
    .map((item) => {
      const product = products.find((candidate) => candidate.slug === item.slug || candidate.id === item.slug);
      if (!product) return null;

      return {
        id: product.sku,
        width: 12,
        height: 18,
        length: 12,
        weight: parseWeight(product.weight),
        insurance_value: Number((product.salePrice ?? product.price).toFixed(2)),
        quantity: item.quantity
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!selectedProducts.length) {
    return NextResponse.json({ error: "Nenhum produto valido para cotacao." }, { status: 400 });
  }

  const services = process.env.MELHOR_ENVIO_CORREIOS_SERVICES || "1,2";
  const originPostalCode = cleanPostalCode(process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE || "11700007");

  try {
    const response = await fetch(`${melhorEnvioBaseUrl()}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": process.env.MELHOR_ENVIO_USER_AGENT || "ZION AROMAS (zionaromasp@gmail.com)"
      },
      body: JSON.stringify({
        from: { postal_code: originPostalCode },
        to: { postal_code: destinationPostalCode },
        products: selectedProducts,
        options: {
          receipt: false,
          own_hand: false
        },
        services
      }),
      signal: AbortSignal.timeout(8_000)
    });

    const data = (await response.json()) as MelhorEnvioService[];

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Nao foi possivel consultar o frete agora.",
          options: fallbackCorreiosQuote()
        },
        { status: 502 }
      );
    }

    const options = data
      .filter((service) => !service.error)
      .map((service) => ({
        id: service.id,
        name: service.name || "Correios",
        company: service.company?.name || "Correios",
        price: Number(service.custom_price || service.price || 0),
        deliveryTime: service.custom_delivery_time || service.delivery_time || 0,
        source: "melhor-envio"
      }))
      .filter((service) => service.price > 0);

    return NextResponse.json({ options: options.length ? options : fallbackCorreiosQuote() });
  } catch {
    return NextResponse.json({
      error: "Nao foi possivel consultar o frete agora.",
      options: fallbackCorreiosQuote()
    });
  }
}
