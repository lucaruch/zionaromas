import { AdminCouponsManager } from "@/components/admin/admin-coupons-manager";
import { getAdminCoupons } from "@/lib/admin-data";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  return <AdminCouponsManager coupons={coupons} />;
}
