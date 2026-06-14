export const dynamic = "force-dynamic";

import { getCategories } from "@/actions/category";
import { CategoryManager } from "@/features/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">หมวดหมู่</h1>
        <p className="mt-2 text-muted-foreground">
          จัดการหมวดหมู่สำหรับการกรองและจัดระเบียบไอเทม
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
