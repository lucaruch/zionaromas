import { AdminCategoriesManager } from "@/components/admin/admin-simple-resource-manager";
import { getAdminCategories } from "@/lib/admin-data";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <AdminCategoriesManager categories={categories} />;
}
