import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { getAdminBrands, getAdminCategories, getAdminProducts, getAdminStats } from "@/lib/admin-data";

export default async function AdminProductsPage() {
  const [products, brands, categories, stats] = await Promise.all([
    getAdminProducts(),
    getAdminBrands(),
    getAdminCategories(),
    getAdminStats()
  ]);

  return <AdminProductsManager products={products} brands={brands} categories={categories} stats={stats} />;
}
