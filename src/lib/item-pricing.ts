import { formatBahtInt } from "@/lib/utils";

export const ITEM_PRICE_FIELDS = [
  {
    name: "sendPrice",
    label: "แบบส่ง (บาท)",
    shortLabel: "แบบส่ง",
  },
  {
    name: "topupPrice",
    label: "แบบเติม (บาท)",
    shortLabel: "แบบเติม",
  },
  {
    name: "preorderPrice",
    label: "แบบพรีออเดอร์ (บาท)",
    shortLabel: "แบบพรีออเดอร์",
  },
] as const;

export type ItemPriceField = (typeof ITEM_PRICE_FIELDS)[number]["name"];

export type ItemPricing = {
  sendPrice: number | null;
  topupPrice: number | null;
  preorderPrice: number | null;
};

/** ราคาที่ใช้คำนวณในหน้า calculator (ปัจจุบัน: แบบส่งเท่านั้น) */
export const CALCULATION_PRICE_FIELD: ItemPriceField = "sendPrice";

export function getItemCalculationPrice(item: ItemPricing): number | null {
  return item[CALCULATION_PRICE_FIELD];
}

export function sumCalculationPrice(items: ItemPricing[]): number {
  return items.reduce(
    (sum, item) => sum + (getItemCalculationPrice(item) ?? 0),
    0,
  );
}

export function formatOptionalBaht(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "—";
  }
  return formatBahtInt(price);
}

export function formatItemPricingSummary(pricing: ItemPricing): string {
  return ITEM_PRICE_FIELDS.map(
    ({ name, shortLabel }) =>
      `${shortLabel} ${formatOptionalBaht(pricing[name])}`,
  ).join(" · ");
}

export function sumItemPricing(
  items: ItemPricing[],
): Record<ItemPriceField, number> {
  const totals: Record<ItemPriceField, number> = {
    sendPrice: 0,
    topupPrice: 0,
    preorderPrice: 0,
  };

  for (const item of items) {
    for (const { name } of ITEM_PRICE_FIELDS) {
      const value = item[name];
      if (value !== null && value !== undefined) {
        totals[name] += value;
      }
    }
  }

  return totals;
}
