export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-roles";
import { getAdminUsers } from "@/actions/admin-user";
import { AdminManager } from "@/features/admin/admin-manager";

export default async function AdminManagePage() {
  const session = await auth();

  if (!session?.user || !isSuperAdmin(session.user.role)) {
    redirect("/admin");
  }

  const admins = await getAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการแอดมิน</h1>
        <p className="mt-2 text-muted-foreground">
          แอดมินหลักสามารถดูสถานะแอดมินและลบแอดมินย่อยออกจากระบบได้
        </p>
      </div>
      <AdminManager admins={admins} currentUserId={session.user.id} />
    </div>
  );
}
