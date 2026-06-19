import type { Rarity } from "@prisma/client";

export const DEFAULT_RARITY: Rarity = "NONE";

export const RARITIES = [
  "NONE",
  "SS",
  "S",
  "A",
  "B",
  "C",
] as const satisfies readonly Rarity[];

export const RARITY_LABELS: Record<Rarity, string> = {
  NONE: "ไม่มี",
  SS: "SS",
  S: "S",
  A: "A",
  B: "B",
  C: "C",
};

export const RARITY_COLORS: Record<Rarity, string> = {
  NONE: "bg-muted text-muted-foreground border border-border",
  SS: "bg-rose-500 text-white",
  S: "bg-amber-500 text-white",
  A: "bg-purple-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-emerald-500 text-white",
};

export function formatRarity(rarity: Rarity): string {
  return RARITY_LABELS[rarity];
}
