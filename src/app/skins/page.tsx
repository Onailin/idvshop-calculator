export const dynamic = "force-dynamic";

import { connection } from "next/server";
import { PageContainer } from "@/components/layout/page-container";
import { SiteHeader } from "@/components/layout/site-header";
import { DatabaseBanner } from "@/components/layout/database-banner";
import { ItemCalculator } from "@/features/calculator/item-calculator";
import { getCategories } from "@/actions/category";
import { getItemsForCalculator } from "@/actions/item";
import { getActivePackageGroupsForCalculator } from "@/actions/package-group";
import { getPackagesForCalculator } from "@/actions/package";
import { isDatabaseConnected } from "@/actions/db";

export default async function SkinsPage() {
  await connection();

  const [items, categories, packages, packageGroups, dbConnected] =
    await Promise.all([
      getItemsForCalculator(),
      getCategories({ orderBy: "newest" }),
      getPackagesForCalculator(),
      getActivePackageGroupsForCalculator(),
      isDatabaseConnected(),
    ]);

  return (
    <div className="page-gradient flex min-h-screen flex-col">
      <SiteHeader />
      {!dbConnected && <DatabaseBanner />}
      <main className="flex-1 py-6 lg:py-8">
        <PageContainer variant="calculator">
        <div className="mb-6 lg:mb-8">
          <span className="ios-pill">เครื่องคำนวณ</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            คำนวณแพ็กเกจสกิน/ไอเท็ม และอีเว้นท์ต่างๆ
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            เลือกไอเท็มได้หลายรายการ เพื่อดูยอดรวมและในราคาจึ้งๆ
          </p>
        </div>
        <ItemCalculator
          items={items}
          categories={categories.map((c: (typeof categories)[number]) => ({
            id: c.id,
            name: c.name,
          }))}
          packages={packages}
          packageGroups={packageGroups}
        />
        </PageContainer>
      </main>
    </div>
  );
}
