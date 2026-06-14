"use client";

import { useMemo, useState, useTransition } from "react";
import { ItemThumbnail } from "@/components/ui/item-thumbnail";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createItem, deleteItem, updateItem } from "@/actions/item";
import { ItemFormFields } from "@/features/admin/item-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatItemPricingSummary } from "@/lib/item-pricing";
import { formatRarity } from "@/lib/rarity";
import { ButtonAmount } from "@/components/ui/button-amount";
import type { Category, Item } from "@/types";

const ITEMS_PER_PAGE = 4;

type ItemWithCategory = Item & { category: Category };

type ItemManagerProps = {
  items: ItemWithCategory[];
  categories: Category[];
};

type ItemRowProps = {
  item: ItemWithCategory;
  categories: Category[];
  editingId: string | null;
  isPending: boolean;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, formData: FormData) => void;
  onDelete: (id: string, name: string) => void;
};

function ItemRow({
  item,
  categories,
  editingId,
  isPending,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: ItemRowProps) {
  if (editingId === item.id) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onUpdate(item.id, new FormData(event.currentTarget));
        }}
        className="grid gap-3 rounded-md border p-4 sm:grid-cols-2"
      >
        <ItemFormFields
          categories={categories}
          idPrefix={`edit-${item.id}`}
          defaults={{
            name: item.name,
            buttonCost: item.buttonCost,
            rarity: item.rarity,
            categoryId: item.categoryId,
            sendPrice: item.sendPrice,
            topupPrice: item.topupPrice,
            preorderPrice: item.preorderPrice,
            imageUrl: item.imageUrl,
          }}
        />
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={isPending}>
            บันทึก
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border p-4">
      <div className="flex items-center gap-3">
        <ItemThumbnail src={item.imageUrl} alt={item.name} variant="admin" />
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatRarity(item.rarity)} ·{" "}
            <ButtonAmount value={item.buttonCost} size="xs" highlight />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatItemPricingSummary(item)}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={() => onEdit(item.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(item.id, item.name)}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

type CategoryItemListProps = {
  items: ItemWithCategory[];
  categories: Category[];
  editingId: string | null;
  isPending: boolean;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, formData: FormData) => void;
  onDelete: (id: string, name: string) => void;
};

function CategoryItemList({
  items,
  categories,
  editingId,
  isPending,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: CategoryItemListProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  const safePage = Math.min(page, totalPages - 1);

  const visibleItems = useMemo(() => {
    const start = safePage * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, safePage]);

  function handleEdit(id: string) {
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) {
      setPage(Math.floor(index / ITEMS_PER_PAGE));
    }
    onEdit(id);
  }

  function goToPage(nextPage: number) {
    setPage(Math.max(0, Math.min(nextPage, totalPages - 1)));
    onCancelEdit();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">ยังไม่มีรายการในหมวดนี้</p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleItems.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          categories={categories}
          editingId={editingId}
          isPending={isPending}
          onEdit={handleEdit}
          onCancelEdit={onCancelEdit}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      {items.length > ITEMS_PER_PAGE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            แสดง {safePage * ITEMS_PER_PAGE + 1}–
            {Math.min((safePage + 1) * ITEMS_PER_PAGE, items.length)} จาก{" "}
            {items.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">
              หน้า {safePage + 1} / {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages - 1}
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ItemManager({ items, categories }: ItemManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, ItemWithCategory[]>(
      categories.map((category) => [category.id, []]),
    );

    for (const item of items) {
      const list = grouped.get(item.categoryId);
      if (list) {
        list.push(item);
        continue;
      }

      const orphanList = grouped.get("__orphan__") ?? [];
      orphanList.push(item);
      grouped.set("__orphan__", orphanList);
    }

    for (const list of grouped.values()) {
      list.sort((a, b) => b.buttonCost - a.buttonCost);
    }

    return grouped;
  }, [items, categories]);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createItem(formData);
      if (result.success) {
        toast.success(result.message);
        (document.getElementById("create-item-form") as HTMLFormElement)?.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateItem(id, formData);
      if (result.success) {
        toast.success(result.message);
        setEditingId(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`ต้องการลบรายการ "${name}" หรือไม่?`)) return;
    startTransition(async () => {
      const result = await deleteItem(id);
      if (result.success) {
        toast.success(result.message);
        if (editingId === id) {
          setEditingId(null);
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มรายการ</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="create-item-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate(new FormData(event.currentTarget));
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <ItemFormFields categories={categories} idPrefix="create" />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                สร้างรายการ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              ยังไม่มีหมวดหมู่ กรุณาสร้างหมวดหมู่ก่อนเพิ่มรายการ
            </p>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => {
          const sectionItems = itemsByCategory.get(category.id) ?? [];

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>
                  {category.name} ({sectionItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryItemList
                  items={sectionItems}
                  categories={categories}
                  editingId={editingId}
                  isPending={isPending}
                  onEdit={setEditingId}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          );
        })
      )}

      {(itemsByCategory.get("__orphan__")?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              ไม่มีหมวดหมู่ ({itemsByCategory.get("__orphan__")!.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryItemList
              items={itemsByCategory.get("__orphan__")!}
              categories={categories}
              editingId={editingId}
              isPending={isPending}
              onEdit={setEditingId}
              onCancelEdit={() => setEditingId(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
