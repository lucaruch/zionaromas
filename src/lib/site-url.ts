export const FALLBACK_PUBLIC_SITE_URL = "https://zionaromas.com";

export function isValidPublicSiteUrl(value?: string) {
  return Boolean(
    value &&
      /^https:\/\/[^/]+/i.test(value) &&
      !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value)
  );
}

export function configuredPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || "";
}

export function getPublicSiteUrl() {
  const configured = configuredPublicSiteUrl();
  if (isValidPublicSiteUrl(configured)) return configured;
  if (process.env.NODE_ENV === "production") return FALLBACK_PUBLIC_SITE_URL;
  return configured || "http://localhost:3000";
}
