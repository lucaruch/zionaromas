import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/commerce/cart-provider";
import { PwaRegister } from "@/components/layout/pwa-register";
import { SiteChrome } from "@/components/layout/site-chrome";
import { getCatalogCategories } from "@/lib/catalog";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCatalogCategories();

  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <PwaRegister />
          <SiteChrome categories={categories}>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
