export const dynamic = "force-dynamic";

import { getCategories } from "@/actions/category";
import { getItemsAdmin } from "@/actions/item";
import { ItemManager } from "@/features/admin/item-manager";

export default async function AdminItemsPage() {
  const [items, categories] = await Promise.all([
    getItemsAdmin(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">รายการไอเทม</h1>
        <p className="mt-2 text-muted-foreground">
          จัดการรายการไอเทมตามหมวดหมู่ — เพิ่มหมวดหมู่ใหม่แล้วจะมีตารางแยกให้อัตโนมัติ
        </p>
      </div>
      <ItemManager items={items} categories={categories} />
    </div>
  );
}
