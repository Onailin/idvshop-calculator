"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ITEM_PRICE_FIELDS } from "@/lib/item-pricing";
import { getUploadFolderForCategoryName } from "@/lib/upload-folder";
import { formatRarity, RARITIES, DEFAULT_RARITY } from "@/lib/rarity";
import type { Category } from "@/types";

type ItemFormDefaults = {
  name?: string;
  buttonCost?: number;
  rarity?: string;
  categoryId?: string;
  sendPrice?: number | null;
  topupPrice?: number | null;
  preorderPrice?: number | null;
  imageUrl?: string | null;
};

type ItemFormFieldsProps = {
  categories: Category[];
  idPrefix?: string;
  defaults?: ItemFormDefaults;
  showImageField?: boolean;
};

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm";

export function ItemFormFields({
  categories,
  idPrefix = "item",
  defaults,
  showImageField = true,
}: ItemFormFieldsProps) {
  const [categoryId, setCategoryId] = useState(defaults?.categoryId ?? "");

  useEffect(() => {
    setCategoryId(defaults?.categoryId ?? "");
  }, [defaults?.categoryId, idPrefix]);

  const uploadFolder = useMemo(() => {
    const category = categories.find((entry) => entry.id === categoryId);
    if (!category) {
      return "items" as const;
    }
    return getUploadFolderForCategoryName(category.name);
  }, [categories, categoryId]);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>ชื่อสกิน / รายการ</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={defaults?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-rarity`}>ระดับความหายาก</Label>
        <select
          id={`${idPrefix}-rarity`}
          name="rarity"
          className={selectClassName}
          defaultValue={defaults?.rarity ?? DEFAULT_RARITY}
          required
        >
          {RARITIES.map((rarity) => (
            <option key={rarity} value={rarity}>
              {formatRarity(rarity)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-buttonCost`}>จำนวนกระดุม</Label>
        <Input
          id={`${idPrefix}-buttonCost`}
          name="buttonCost"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          defaultValue={defaults?.buttonCost}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-categoryId`}>หมวดหมู่</Label>
        <select
          id={`${idPrefix}-categoryId`}
          name="categoryId"
          className={selectClassName}
          defaultValue={defaults?.categoryId ?? ""}
          onChange={(event) => setCategoryId(event.target.value)}
          required
        >
          <option value="">เลือกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {ITEM_PRICE_FIELDS.map(({ name, label }) => (
        <div key={name} className="space-y-2">
          <Label htmlFor={`${idPrefix}-${name}`}>{label}</Label>
          <Input
            id={`${idPrefix}-${name}`}
            name={name}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="เว้นว่างได้"
            defaultValue={
              defaults?.[name] !== null && defaults?.[name] !== undefined
                ? defaults[name]
                : undefined
            }
          />
        </div>
      ))}

      {showImageField && (
        <div className="sm:col-span-2">
          <ImageUploadField
            key={`${idPrefix}-image-${defaults?.imageUrl ?? "empty"}`}
            id={`${idPrefix}-image`}
            folder={uploadFolder}
            defaultUrl={defaults?.imageUrl}
          />
        </div>
      )}
    </>
  );
}
