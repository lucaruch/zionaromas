import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "zion_admin";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "zion2026";
}

export function getAdminSessionToken() {
  const secret = process.env.AUTH_SECRET || "zion-local-secret";
  return createHash("sha256").update(`${getAdminPassword()}:${secret}`).digest("hex");
}

export async function isAdminUnlocked() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionToken();
}
