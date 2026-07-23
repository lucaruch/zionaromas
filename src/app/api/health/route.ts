import { NextResponse } from "next/server";
import { getPublicationStatus } from "@/lib/publication-status";

export async function GET() {
  const status = await getPublicationStatus();
  return NextResponse.json(status, {
    status: status.checks.some((item) => item.label === "Banco de dados" && item.status === "pending") ? 503 : 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
