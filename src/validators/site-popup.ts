import { z } from "zod";
import {
  SITE_POPUP_HEADLINE_ICONS,
  SITE_POPUP_HEADLINE_STYLES,
} from "@/lib/site-popup-headline";
import { requiredStoredImageUrlSchema } from "@/validators/stored-image-url";

export const sitePopupImageSchema = z.object({
  imageUrl: requiredStoredImageUrlSchema,
  imageAlt: z
    .string()
    .min(2, "คำอธิบายรูปต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(200, "คำอธิบายรูปต้องไม่เกิน 200 ตัวอักษร"),
  linkUrl: z
    .string()
    .url("ลิงก์ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
});

export const sitePopupSchema = z.object({
  headline: z
    .string()
    .max(200, "หัวข้อต้องไม่เกิน 200 ตัวอักษร")
    .optional()
    .or(z.literal("")),
  headlineIcon: z.enum(SITE_POPUP_HEADLINE_ICONS).default("sparkles"),
  headlineStyle: z.enum(SITE_POPUP_HEADLINE_STYLES).default("rose"),
  body: z
    .string()
    .max(500, "ข้อความต้องไม่เกิน 500 ตัวอักษร")
    .optional()
    .or(z.literal("")),
  images: z
    .array(sitePopupImageSchema)
    .min(1, "กรุณาอัปโหลดอย่างน้อย 1 รูป"),
});

export type SitePopupInput = z.infer<typeof sitePopupSchema>;
export type SitePopupImageInput = z.infer<typeof sitePopupImageSchema>;
