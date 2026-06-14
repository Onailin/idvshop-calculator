"use client";

import { useTransition } from "react";
import { Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import {
  createAdminUser,
  deleteAdminUser,
  type AdminUserListItem,
} from "@/actions/admin-user";
import { MAX_ADMINS, formatRole } from "@/lib/admin-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminManagerProps = {
  admins: AdminUserListItem[];
  currentUserId: string;
};

export function AdminManager({ admins, currentUserId }: AdminManagerProps) {
  const [isPending, startTransition] = useTransition();
  const canCreate = admins.length < MAX_ADMINS;

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createAdminUser(formData);
      if (result.success) {
        toast.success(result.message);
        (document.getElementById("create-admin-form") as HTMLFormElement)?.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string, username: string) {
    if (!confirm(`ต้องการลบแอดมิน "${username}" ออกจากระบบหรือไม่?`)) return;

    startTransition(async () => {
      const result = await deleteAdminUser(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ภาพรวมแอดมิน</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            แอดมินในระบบ {admins.length} / {MAX_ADMINS} คน
          </p>
        </CardContent>
      </Card>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มแอดมิน</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="create-admin-form"
              action={handleCreate}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isPending}>
                  สร้างแอดมิน
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>บัญชีแอดมิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between gap-4 rounded-md border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserCog className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{admin.username}</p>
                  <p className="text-xs text-muted-foreground">
                    เข้าร่วมเมื่อ {new Date(admin.createdAt).toLocaleDateString("th-TH")}
                    {admin.id === currentUserId ? " · คุณ" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={admin.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                  {formatRole(admin.role)}
                </Badge>
                {admin.role === "ADMIN" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(admin.id, admin.username)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
