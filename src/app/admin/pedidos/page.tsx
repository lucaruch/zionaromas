import { AdminOrdersManager } from "@/components/admin/admin-orders-manager";
import { getAdminOrders } from "@/lib/admin-data";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return <AdminOrdersManager orders={orders} />;
}
