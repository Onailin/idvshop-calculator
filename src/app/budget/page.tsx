export const dynamic = "force-dynamic";

import { connection } from "next/server";
import { PageContainer } from "@/components/layout/page-container";
import { SiteHeader } from "@/components/layout/site-header";
import { DatabaseBanner } from "@/components/layout/database-banner";
import { PackageCalculatorPage } from "@/features/calculator/package-calculator-page";
import { getPackagesForCalculator } from "@/actions/package";
import { isDatabaseConnected } from "@/actions/db";

export default async function BudgetPage() {
  await connection();

  const [packages, dbConnected] = await Promise.all([
    getPackagesForCalculator(),
    isDatabaseConnected(),
  ]);

  return (
    <div className="page-gradient flex min-h-screen flex-col">
      <SiteHeader />
      {!dbConnected && <DatabaseBanner />}
      <main className="flex-1 py-8">
        <PageContainer variant="calculator">
          <div className="mb-8 text-center sm:text-left">
            <span className="ios-pill">เครื่องคำนวณ</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              คำนวณงบที่คุณมี หรือคูปองได้เลย
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground sm:mx-0 mx-auto">
              คำนวณงบ กระดุม ยอดเติมสะสม และจัดสรรคูปองให้คุ้มที่สุด
            </p>
          </div>
          <PackageCalculatorPage packages={packages} />
        </PageContainer>
      </main>
    </div>
  );
}
