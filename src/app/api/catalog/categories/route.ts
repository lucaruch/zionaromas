import { NextResponse } from "next/server";
import { getCatalogCategories } from "@/lib/catalog";

export async function GET() {
  const categories = await getCatalogCategories();
  return NextResponse.json({ categories });
}
