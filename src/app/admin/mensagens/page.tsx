import { AdminMessagesManager } from "@/components/admin/admin-messages-manager";
import { getAdminContactMessages } from "@/lib/admin-data";

export default async function AdminMessagesPage() {
  const messages = await getAdminContactMessages();
  return <AdminMessagesManager messages={messages} />;
}
