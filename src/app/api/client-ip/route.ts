import { NextResponse } from "next/server";

export const runtime = "nodejs";

function firstForwardedIp(value: string | null) {
  return (value || "")
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);
}

function cleanIp(value: string | undefined) {
  if (!value) return "";
  return value.replace(/[^0-9a-fA-F:.]/g, "").slice(0, 45);
}

export async function GET(request: Request) {
  const headers = request.headers;
  const ip =
    cleanIp(firstForwardedIp(headers.get("x-forwarded-for"))) ||
    cleanIp(headers.get("cf-connecting-ip") || undefined) ||
    cleanIp(headers.get("x-real-ip") || undefined) ||
    cleanIp(headers.get("x-client-ip") || undefined);

  return NextResponse.json(
    { ip: ip || "127.0.0.1" },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
