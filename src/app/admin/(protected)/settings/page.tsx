export const dynamic = "force-dynamic";

import { ChangePasswordForm } from "@/features/admin/change-password-form";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">การตั้งค่า</h1>
        <p className="mt-2 text-muted-foreground">
          จัดการรหัสผ่านบัญชีของคุณ
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
