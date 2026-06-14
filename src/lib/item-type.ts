import type { ItemType } from "@prisma/client";

export const ITEM_TYPES: ItemType[] = [
  "SKIN",
  "ACCESSORY",
  "PET",
  "FURNITURE",
];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  SKIN: "สกิน",
  ACCESSORY: "เครื่องประดับ",
  PET: "สัตว์เลี้ยง",
  FURNITURE: "บ้าน",
};

export function formatItemType(type: ItemType): string {
  return ITEM_TYPE_LABELS[type];
}

export function inferItemTypeFromCategoryName(name: string): ItemType {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("accessory") ||
    normalized.includes("เครื่องประดับ")
  ) {
    return "ACCESSORY";
  }
  if (normalized.includes("pet") || normalized.includes("สัตว์")) {
    return "PET";
  }
  if (
    normalized.includes("furniture") ||
    normalized.includes("เฟอร์") ||
    normalized.includes("บ้าน")
  ) {
    return "FURNITURE";
  }
  if (normalized.includes("skin") || normalized.includes("สกิน")) {
    return "SKIN";
  }

  return "SKIN";
}
