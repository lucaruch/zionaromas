import { AdminCustomersManager } from "@/components/admin/admin-customers-manager";
import { getAdminCustomers } from "@/lib/admin-data";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return <AdminCustomersManager customers={customers} />;
}
