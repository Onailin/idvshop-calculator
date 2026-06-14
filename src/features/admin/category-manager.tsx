"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CategoryItem = {
  id: string;
  name: string;
  _count: { items: number };
};

type CategoryManagerProps = {
  categories: CategoryItem[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createCategory(formData);
      if (result.success) {
        toast.success(result.message);
        (document.getElementById("create-category-form") as HTMLFormElement)?.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdate(id: string) {
    const formData = new FormData();
    formData.set("name", editName);
    startTransition(async () => {
      const result = await updateCategory(id, formData);
      if (result.success) {
        toast.success(result.message);
        setEditingId(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`ต้องการลบหมวดหมู่ "${name}" หรือไม่? รายการที่เกี่ยวข้องจะถูกลบทั้งหมด`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="create-category-form"
            action={handleCreate}
            className="flex gap-2"
          >
            <Input name="name" placeholder="ชื่อหมวดหมู่" required />
            <Button type="submit" disabled={isPending}>
              เพิ่ม
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>หมวดหมู่ ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีหมวดหมู่</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-md border p-3"
              >
                {editingId === category.id ? (
                  <div className="flex flex-1 gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(category.id)}
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
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category._count.items} รายการ
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditName(category.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id, category.name)}
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
        </CardContent>
      </Card>
    </div>
  );
}
