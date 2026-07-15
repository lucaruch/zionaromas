import type { NextConfig } from "next";

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
      "form-action 'self'",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      process.env.NODE_ENV === "production"
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://viacep.com.br https://sandbox.melhorenvio.com.br https://www.melhorenvio.com.br https://melhorenvio.com.br"
    ].join("; ")
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]
    : [])
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },
  headers: async () => [
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
