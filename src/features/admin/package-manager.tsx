"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPackage,
  deletePackage,
  updatePackage,
} from "@/actions/package";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBahtInt, formatButtons } from "@/lib/utils";

const PACKAGE_GROUP_ORDER = [
  "Discount 10%",
  "Discount 3%",
  "Regular",
  "Pre-order",
] as const;

type PackageGroupOption = {
  id: string;
  name: string;
};

type PackageItem = {
  id: string;
  buttons: number;
  topupAmount: number | null;
  price: number;
  packageGroupId: string;
  packageGroup: PackageGroupOption;
};

type PackageManagerProps = {
  packages: PackageItem[];
  groups: PackageGroupOption[];
};

type EditForm = {
  buttons: string;
  topupAmount: string;
  price: string;
};

const emptyEditForm: EditForm = {
  buttons: "",
  topupAmount: "",
  price: "",
};

function sortGroups(groups: PackageGroupOption[]) {
  const orderMap = new Map(
    PACKAGE_GROUP_ORDER.map((name, index) => [name, index]),
  );

  return [...groups].sort((a, b) => {
    const orderA = orderMap.get(a.name as (typeof PACKAGE_GROUP_ORDER)[number]);
    const orderB = orderMap.get(b.name as (typeof PACKAGE_GROUP_ORDER)[number]);

    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }
    if (orderA !== undefined) {
      return -1;
    }
    if (orderB !== undefined) {
      return 1;
    }
    return a.name.localeCompare(b.name, "th");
  });
}

type PackageGroupTableProps = {
  group: PackageGroupOption;
  packages: PackageItem[];
  isPending: boolean;
  editingId: string | null;
  editForm: EditForm;
  onEditStart: (pkg: PackageItem) => void;
  onEditCancel: () => void;
  onEditChange: (form: EditForm) => void;
  onUpdate: (id: string, groupId: string) => void;
  onDelete: (id: string, label: string) => void;
};

function PackageGroupTable({
  group,
  packages,
  isPending,
  editingId,
  editForm,
  onEditStart,
  onEditCancel,
  onEditChange,
  onUpdate,
  onDelete,
}: PackageGroupTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {group.name} ({packages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">กระดุม</th>
                <th className="px-3 py-2 text-left font-medium">ยอดเติม</th>
                <th className="px-3 py-2 text-left font-medium">ราคา</th>
                <th className="px-3 py-2 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    ยังไม่มีแพ็กเกจในกลุ่มนี้
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="border-t">
                    {editingId === pkg.id ? (
                      <td colSpan={4} className="px-3 py-3">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <Input
                            value={editForm.buttons}
                            onChange={(e) =>
                              onEditChange({
                                ...editForm,
                                buttons: e.target.value,
                              })
                            }
                            type="number"
                            min="1"
                            placeholder="กระดุม"
                          />
                          <Input
                            value={editForm.topupAmount}
                            onChange={(e) =>
                              onEditChange({
                                ...editForm,
                                topupAmount: e.target.value,
                              })
                            }
                            type="number"
                            min="1"
                            placeholder="ยอดเติม"
                          />
                          <Input
                            value={editForm.price}
                            onChange={(e) =>
                              onEditChange({
                                ...editForm,
                                price: e.target.value,
                              })
                            }
                            type="number"
                            min="1"
                            placeholder="ราคา"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onUpdate(pkg.id, group.id)}
                              disabled={isPending}
                            >
                              บันทึก
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onEditCancel}
                            >
                              ยกเลิก
                            </Button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2">
                          {formatButtons(pkg.buttons)}
                        </td>
                        <td className="px-3 py-2">
                          {pkg.topupAmount
                            ? formatButtons(pkg.topupAmount)
                            : "-"}
                        </td>
                        <td className="px-3 py-2">
                          {formatBahtInt(pkg.price)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEditStart(pkg)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                onDelete(
                                  pkg.id,
                                  `${group.name} ${pkg.buttons} กระดุม`,
                                )
                              }
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function PackageManager({ packages, groups }: PackageManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm);

  const sortedGroups = useMemo(() => sortGroups(groups), [groups]);
  const [selectedGroupId, setSelectedGroupId] = useState(
    () => sortedGroups[0]?.id ?? "",
  );

  const packagesByGroup = useMemo(() => {
    const map = new Map<string, PackageItem[]>();

    for (const group of sortedGroups) {
      map.set(group.id, []);
    }

    for (const pkg of packages) {
      const list = map.get(pkg.packageGroupId);
      if (list) {
        list.push(pkg);
      }
    }

    for (const list of map.values()) {
      list.sort((a, b) => a.buttons - b.buttons);
    }

    return map;
  }, [packages, sortedGroups]);

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("packageGroupId", selectedGroupId);

    startTransition(async () => {
      const result = await createPackage(formData);
      if (result.success) {
        toast.success(result.message);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdate(id: string, groupId: string) {
    const formData = new FormData();
    formData.set("buttons", editForm.buttons);
    formData.set("topupAmount", editForm.topupAmount);
    formData.set("price", editForm.price);
    formData.set("packageGroupId", groupId);

    startTransition(async () => {
      const result = await updatePackage(id, formData);
      if (result.success) {
        toast.success(result.message);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`ต้องการลบแพ็กเกจ "${label}" หรือไม่?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deletePackage(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>แพ็กเกจ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            กรุณาสร้างกลุ่มแพ็กเกจก่อนเพิ่มแพ็กเกจ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มแพ็กเกจ</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreate}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2">
              <Label htmlFor="create-group">กลุ่ม</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger id="create-group">
                  <SelectValue placeholder="เลือกกลุ่ม" />
                </SelectTrigger>
                <SelectContent>
                  {sortedGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-buttons">กระดุม</Label>
              <Input
                id="create-buttons"
                name="buttons"
                type="number"
                min="1"
                placeholder="203"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-topup">ยอดเติม</Label>
              <Input
                id="create-topup"
                name="topupAmount"
                type="number"
                min="1"
                placeholder="185"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-price">ราคา (บาท)</Label>
              <Input
                id="create-price"
                name="price"
                type="number"
                min="1"
                placeholder="90"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isPending} className="w-full">
                เพิ่มแพ็กเกจ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {sortedGroups.map((group) => (
        <PackageGroupTable
          key={group.id}
          group={group}
          packages={packagesByGroup.get(group.id) ?? []}
          isPending={isPending}
          editingId={editingId}
          editForm={editForm}
          onEditStart={(pkg) => {
            setEditingId(pkg.id);
            setEditForm({
              buttons: String(pkg.buttons),
              topupAmount: pkg.topupAmount ? String(pkg.topupAmount) : "",
              price: String(pkg.price),
            });
          }}
          onEditCancel={() => setEditingId(null)}
          onEditChange={setEditForm}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
