type SmokeCheck = {
  name: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  expectStatus?: number[];
  expectText?: string[];
  expectAnyText?: string[];
  rejectText?: string[];
  expectHeaders?: string[];
};

type SmokeResult = {
  name: string;
  url: string;
  ok: boolean;
  status: number;
  details: string[];
};

const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.PUBLICATION_URL || process.env.NEXT_PUBLIC_SITE_URL);

const checks: SmokeCheck[] = [
  {
    name: "Home",
    path: "/",
    expectText: ["ZION AROMAS"],
    expectHeaders: ["content-security-policy", "x-content-type-options", "referrer-policy"]
  },
  {
    name: "Catalogo",
    path: "/produtos",
    expectText: ["ZION AROMAS"],
    expectHeaders: ["content-security-policy", "x-content-type-options"]
  },
  {
    name: "Checkout",
    path: "/checkout",
    expectText: ["checkout", "frete"],
    expectHeaders: ["content-security-policy", "x-content-type-options"]
  },
  {
    name: "Contato",
    path: "/contato",
    expectText: ["WhatsApp", "Instagram"]
  },
  {
    name: "FAQ",
    path: "/faq",
    expectText: ["frete"]
  },
  {
    name: "Trocas e devolucoes",
    path: "/trocas-e-devolucoes",
    expectText: ["troca", "devolu"]
  },
  {
    name: "Politica de privacidade",
    path: "/politica-de-privacidade",
    expectText: ["privacidade", "dados"]
  },
  {
    name: "Termos",
    path: "/termos",
    expectText: ["termos"]
  },
  {
    name: "Robots",
    path: "/robots.txt",
    expectText: ["User-agent"]
  },
  {
    name: "Sitemap",
    path: "/sitemap.xml",
    expectText: ["urlset"],
    rejectText: ["localhost", "127.0.0.1"]
  },
  {
    name: "Healthcheck",
    path: "/api/health",
    expectStatus: [200, 503],
    expectText: ["Banco de dados"],
    rejectText: ["localhost", "127.0.0.1"]
  },
  {
    name: "Admin nao indexavel",
    path: "/admin",
    expectText: ["senha"],
    expectHeaders: ["x-robots-tag", "content-security-policy", "x-content-type-options"]
  },
  {
    name: "API admin protegida",
    path: "/api/admin/produtos",
    expectStatus: [401],
    expectText: ["autorizado"]
  },
  {
    name: "Webhook rejeita POST sem segredo",
    path: "/api/webhooks/payment",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { orderCode: "ZA-TESTE", status: "approved" },
    expectStatus: [401, 503],
    expectAnyText: ["autorizado", "configurado"]
  },
  {
    name: "Webhook publica",
    path: "/api/webhooks/payment",
    expectStatus: [200, 503],
    expectText: ["/api/webhooks/payment", "POST"]
  }
];

function normalizeBaseUrl(value?: string) {
  if (!value) {
    throw new Error("Informe a URL: npm run smoke:production -- https://zionaromas.com");
  }

  return value.replace(/\/+$/, "");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function runCheck(check: SmokeCheck): Promise<SmokeResult> {
  const url = `${baseUrl}${check.path}`;
  const response = await fetch(url, {
    method: check.method || "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "ZION AROMAS publication smoke test",
      ...(check.headers || {})
    },
    body: check.body === undefined ? undefined : JSON.stringify(check.body),
    signal: AbortSignal.timeout(15_000)
  });
  const body = await response.text();
  const acceptedStatuses = check.expectStatus || [200];
  const details: string[] = [];

  if (!acceptedStatuses.includes(response.status)) {
    details.push(`status ${response.status}, esperado ${acceptedStatuses.join(" ou ")}`);
  }

  for (const header of check.expectHeaders || []) {
    if (!response.headers.get(header)) details.push(`header ausente: ${header}`);
  }

  const normalizedBody = normalizeText(body);
  for (const expected of check.expectText || []) {
    if (!normalizedBody.includes(normalizeText(expected))) {
      details.push(`texto ausente: ${expected}`);
    }
  }

  const expectedAnyTexts = check.expectAnyText || [];
  if (expectedAnyTexts.length && !expectedAnyTexts.some((expected) => normalizedBody.includes(normalizeText(expected)))) {
    details.push(`texto ausente: ${expectedAnyTexts.join(" ou ")}`);
  }

  for (const rejected of check.rejectText || []) {
    if (normalizedBody.includes(normalizeText(rejected))) {
      details.push(`texto indevido encontrado: ${rejected}`);
    }
  }

  return {
    name: check.name,
    url,
    ok: details.length === 0,
    status: response.status,
    details
  };
}

async function main() {
  const results: SmokeResult[] = [];

  for (const check of checks) {
    try {
      results.push(await runCheck(check));
    } catch (error) {
      results.push({
        name: check.name,
        url: `${baseUrl}${check.path}`,
        ok: false,
        status: 0,
        details: [error instanceof Error ? error.message : "erro desconhecido"]
      });
    }
  }

  for (const result of results) {
    const status = result.ok ? "OK" : "FALHOU";
    console.log(`${status} ${result.name} ${result.status} ${result.url}`);
    for (const detail of result.details) console.log(`  - ${detail}`);
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    console.error(`\n${failed.length} verificacao(oes) falharam.`);
    process.exit(1);
  }

  console.log("\nSmoke test de publicacao aprovado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
