import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "zion_admin";

export function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production" && (!password || password === "zion2026")) {
    throw new Error("ADMIN_PASSWORD must be configured for production.");
  }
  return password || "zion2026";
}

export function getAdminSessionToken() {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("AUTH_SECRET must be configured for production.");
  }
  return createHash("sha256").update(`${getAdminPassword()}:${secret || "zion-local-secret"}`).digest("hex");
}

export function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function isAdminUnlocked() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(value && secureCompare(value, getAdminSessionToken()));
}
