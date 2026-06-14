"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPackageGroup,
  deletePackageGroup,
  togglePackageGroupActive,
  updatePackageGroup,
} from "@/actions/package-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PackageGroupItem = {
  id: string;
  name: string;
  isActive: boolean;
  _count: { packages: number };
};

type PackageGroupManagerProps = {
  groups: PackageGroupItem[];
};

export function PackageGroupManager({ groups }: PackageGroupManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createActive, setCreateActive] = useState(true);
  const [editForm, setEditForm] = useState({ name: "", isActive: true });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("name", createName);
    formData.set("isActive", createActive ? "true" : "false");

    startTransition(async () => {
      const result = await createPackageGroup(formData);
      if (result.success) {
        toast.success(result.message);
        setCreateName("");
        setCreateActive(true);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdate(id: string) {
    const formData = new FormData();
    formData.set("name", editForm.name);
    formData.set("isActive", editForm.isActive ? "true" : "false");

    startTransition(async () => {
      const result = await updatePackageGroup(id, formData);
      if (result.success) {
        toast.success(result.message);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await togglePackageGroupActive(id, isActive);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `ต้องการลบกลุ่ม "${name}" หรือไม่? แพ็กเกจทั้งหมดในกลุ่มนี้จะถูกลบด้วย`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deletePackageGroup(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>กลุ่มแพ็กเกจ ({groups.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          id="create-package-group-form"
          onSubmit={handleCreate}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="group-name">ชื่อกลุ่ม</Label>
            <Input
              id="group-name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="เช่น Regular"
              required
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Checkbox
              id="group-active"
              checked={createActive}
              onCheckedChange={(checked) => setCreateActive(checked === true)}
            />
            <Label htmlFor="group-active">เปิดใช้งาน</Label>
          </div>
          <Button type="submit" disabled={isPending}>
            เพิ่มกลุ่ม
          </Button>
        </form>

        <div className="space-y-3">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีกลุ่มแพ็กเกจ</p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between gap-2 rounded-md border p-3"
              >
                {editingId === group.id ? (
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={editForm.isActive}
                        onCheckedChange={(checked) =>
                          setEditForm((prev) => ({
                            ...prev,
                            isActive: checked === true,
                          }))
                        }
                      />
                      <Label>เปิดใช้งาน</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(group.id)}
                        disabled={isPending}
                      >
                        บันทึก
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{group.name}</p>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {group._count.packages} แพ็กเกจ
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title={group.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        onClick={() => handleToggle(group.id, !group.isActive)}
                        disabled={isPending}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(group.id);
                          setEditForm({
                            name: group.name,
                            isActive: group.isActive,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(group.id, group.name)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
