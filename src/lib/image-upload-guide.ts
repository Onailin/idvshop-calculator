import type { S3UploadFolder } from "@/types/upload";

/** ขนาดที่แสดงบนหน้าเว็บ (CSS) — ไม่ใช่ขนาดไฟล์ที่อัปโหลด */
export const ITEM_IMAGE_DISPLAY_PX = {
  card: { mobile: 144, desktop: 176 },
  summary: 112,
  adminPreview: 160,
} as const;

/** แนะนำขนาดไฟล์ต้นฉบับก่อนอัปโหลด */
export const ITEM_IMAGE_UPLOAD_GUIDE = {
  recommendedPx: 512,
  minPx: 256,
  maxFileMb: 50,
  formats: "PNG (ไม่มีพื้นหลัง), WebP, JPG",
} as const;

export function getImageUploadHint(folder: S3UploadFolder): string {
  if (folder === "skins" || folder === "items") {
    return `${ITEM_IMAGE_UPLOAD_GUIDE.formats} · แนะนำ ${ITEM_IMAGE_UPLOAD_GUIDE.recommendedPx}×${ITEM_IMAGE_UPLOAD_GUIDE.recommendedPx} px · ไม่เกิน ${ITEM_IMAGE_UPLOAD_GUIDE.maxFileMb}MB · บนเว็บแสดง ~${ITEM_IMAGE_DISPLAY_PX.card.desktop}px`;
  }

  if (folder === "banners") {
    return "JPG, PNG, WebP · แนะนำ 1920×640 px · ไม่เกิน 10MB";
  }

  return "JPG, PNG, WebP · ไม่เกิน 10MB";
}
