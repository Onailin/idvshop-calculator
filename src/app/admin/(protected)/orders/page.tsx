export const dynamic = "force-dynamic";

import { getAdminOrders } from "@/actions/order";
import { OrderManager } from "@/features/admin/order-manager";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders("ALL");

  return <OrderManager initialOrders={orders} />;
}
