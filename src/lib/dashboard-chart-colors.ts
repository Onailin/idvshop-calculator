import type { ItemType, Rarity } from "@prisma/client";

export const CHART_PALETTE = [
  "#d692a4",
  "#c4b5fd",
  "#6ee7b7",
  "#93c5fd",
  "#fcd34d",
  "#fb923c",
  "#f472b6",
  "#a3e635",
] as const;

export const ITEM_TYPE_CHART_COLORS: Record<ItemType, string> = {
  SKIN: "#d692a4",
  ACCESSORY: "#c4b5fd",
  PET: "#6ee7b7",
  FURNITURE: "#93c5fd",
};

export const RARITY_CHART_COLORS: Record<Rarity, string> = {
  S_PLUS: "#f43f5e",
  S: "#f59e0b",
  A: "#a855f7",
  B: "#3b82f6",
  C: "#10b981",
  NONE: "#94a3b8",
};

export const IMAGE_COVERAGE_COLORS = {
  withImage: "#d692a4",
  withoutImage: "#e2e8f0",
} as const;
