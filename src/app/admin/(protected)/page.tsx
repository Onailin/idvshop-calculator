export const dynamic = "force-dynamic";

import { FolderOpen, Package, Boxes } from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { DashboardCharts } from "@/features/admin/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
        <p className="mt-2 text-muted-foreground">
          ภาพรวมข้อมูลเครื่องคำนวณราคา Identity V ของคุณ
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รายการทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">หมวดหมู่</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCategories}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">แพ็กเกจ</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPackages}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalPackageGroups} กลุ่ม
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts charts={stats.charts} />
    </div>
  );
}
