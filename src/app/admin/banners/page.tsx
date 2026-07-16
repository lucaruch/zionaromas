import { AdminBannersManager } from "@/components/admin/admin-simple-resource-manager";
import { getAdminBanners } from "@/lib/admin-data";

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();
  return <AdminBannersManager banners={banners} />;
}
