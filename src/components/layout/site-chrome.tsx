"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { CatalogCategory } from "@/lib/catalog";

export function SiteChrome({ children, categories }: { children: React.ReactNode; categories: CatalogCategory[] }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

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
