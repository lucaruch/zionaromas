import { NextResponse } from "next/server";
import { products } from "@/lib/data";
import { isRateLimited } from "@/lib/security";

export async function GET(request: Request) {
  if (isRateLimited(request, "search", 60, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 80).toLowerCase();

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = products
    .filter((product) =>
      [product.name, product.category, product.shortDescription, product.sku]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
    .slice(0, 12);

  return NextResponse.json({ results });
}
