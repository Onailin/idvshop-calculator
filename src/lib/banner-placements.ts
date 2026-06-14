export const BANNER_PLACEMENTS = [
  "home_hero",
  "home_event",
  "home_calculator",
] as const;

export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number];

export const BANNER_PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  home_hero: "หน้าแรก — แบนเนอร์หลัก",
  home_event: "หน้าแรก — อีเว้นต์ (สไลด์)",
  home_calculator: "หน้าแรก — รูปส่วนคำนวณ",
};

export function isBannerPlacement(value: string): value is BannerPlacement {
  return (BANNER_PLACEMENTS as readonly string[]).includes(value);
}

export function formatBannerPlacement(placement: string | null | undefined): string {
  if (!placement || !isBannerPlacement(placement)) {
    return "ไม่ระบุตำแหน่ง";
  }
  return BANNER_PLACEMENT_LABELS[placement];
}
