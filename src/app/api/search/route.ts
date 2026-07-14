import { NextResponse } from "next/server";
import { products } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";
  const results = products.filter((product) =>
    [product.name, product.category, product.shortDescription, product.sku]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  return NextResponse.json({ results });
}
