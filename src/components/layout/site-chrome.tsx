"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { CatalogCategory } from "@/lib/catalog";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [categories, setCategories] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/catalog/categories")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setCategories(data?.categories || []))
      .catch(() => setCategories([]));
  }, [isAdmin]);

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <SiteHeader categories={categories} />
      <main>{children}</main>
      <SiteFooter categories={categories} />
    </>
  );
}
