export const dynamic = "force-dynamic";

import { getPackageGroups } from "@/actions/package-group";
import { getPackages } from "@/actions/package";
import { PackageGroupManager } from "@/features/admin/package-group-manager";
import { PackageManager } from "@/features/admin/package-manager";

export default async function AdminPackagesPage() {
  const [groups, packages] = await Promise.all([
    getPackageGroups(),
    getPackages(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แพ็กเกจ</h1>
        <p className="mt-2 text-muted-foreground">
          จัดการกลุ่มแพ็กเกจและแพ็กเกจกระดุมสำหรับระบบแนะนำการซื้อ
        </p>
      </div>
      <PackageGroupManager groups={groups} />
      <PackageManager
        packages={packages}
        groups={groups.map((group) => ({ id: group.id, name: group.name }))}
      />
    </div>
  );
}
