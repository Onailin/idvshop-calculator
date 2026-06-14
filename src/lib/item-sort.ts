import type { Rarity } from "@prisma/client";
import type { CalculatorItem } from "@/types";

function isSkinCategory(item: CalculatorItem): boolean {
  return item.type === "SKIN" || item.categoryName.includes("สกิน");
}

function isAccessoryCategory(item: CalculatorItem): boolean {
  return (
    item.type === "ACCESSORY" || item.categoryName.includes("เครื่องประดับ")
  );
}

function isSRarity(rarity: Rarity): boolean {
  return rarity === "S" || rarity === "S_PLUS";
}

function getCalculatorItemSortTier(item: CalculatorItem): number {
  if (!isSRarity(item.rarity)) {
    return 2;
  }

  if (isSkinCategory(item)) {
    return 0;
  }

  if (isAccessoryCategory(item)) {
    return 1;
  }

  return 2;
}

export function compareCalculatorItems(
  a: CalculatorItem,
  b: CalculatorItem,
): number {
  const tierDiff = getCalculatorItemSortTier(a) - getCalculatorItemSortTier(b);
  if (tierDiff !== 0) {
    return tierDiff;
  }

  return b.buttonCost - a.buttonCost;
}

export function sortCalculatorItems(items: CalculatorItem[]): CalculatorItem[] {
  return [...items].sort(compareCalculatorItems);
}

export function chunkItems<T>(items: T[], size: number): T[][] {
  if (size <= 0 || items.length === 0) {
    return [];
  }

  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}
