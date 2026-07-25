import type { NextConfig } from "next";

/** Domínios necessários para o desafio 3DS (Cardinal + Braspag MPI + ACS dos bancos). */
const threeDsScriptSrc = [
  "'unsafe-eval'", // Cardinal Songbird exige eval
  "https://*.cardinalcommerce.com",
  "https://*.cardinaltrusted.com",
  "https://static.client.cardinaltrusted.com",
  "https://cas.static.client.cardinaltrusted.com",
  "https://songbird.cardinalcommerce.com",
  "https://songbirdstag.cardinalcommerce.com"
].join(" ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      // Formulários do desafio 3DS postam para o ACS do banco (domínio variável).
      "form-action 'self' https:",
      // ACS dos emissores muda por banco — wildcard é o padrão recomendado para 3DS 2.x.
      "frame-src 'self' https: data: blob:",
      "child-src 'self' https: data: blob:",
      "worker-src 'self' blob: https:",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      // script-src: Songbird + MPI. unsafe-eval é obrigatório para o Cardinal.
      `script-src 'self' 'unsafe-inline' ${threeDsScriptSrc}`,
      // connect-src amplo em https: — 3DS fala com dezenas de ACS/Cardinal/Braspag.
      [
        "connect-src 'self' https: wss:",
        "https://viacep.com.br",
        "https://sandbox.melhorenvio.com.br",
        "https://www.melhorenvio.com.br",
        "https://melhorenvio.com.br",
        "https://api.cieloecommerce.cielo.com.br",
        "https://apisandbox.cieloecommerce.cielo.com.br"
      ].join(" ")
    ].join("; ")
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]
    : [])
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },
  headers: async () => [
    {
      source: "/admin/:path*",
      headers: [
        ...securityHeaders,
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
      ]
    },
    {
      source: "/sw.js",
      headers: [
        ...securityHeaders,
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" }
      ]
    },
    {
      source: "/(.*)",
      headers: securityHeaders
    }
  ]
};

export default nextConfig;
