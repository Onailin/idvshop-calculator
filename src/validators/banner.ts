import { z } from "zod";
import { BANNER_PLACEMENTS } from "@/lib/banner-placements";
import { requiredStoredImageUrlSchema } from "@/validators/stored-image-url";

export const bannerSchema = z.object({
  title: z
    .string()
    .max(150, "ชื่อต้องไม่เกิน 150 ตัวอักษร")
    .optional()
    .or(z.literal("")),
  alt: z
    .string()
    .min(2, "คำอธิบายรูปต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(200, "คำอธิบายรูปต้องไม่เกิน 200 ตัวอักษร"),
  imageUrl: requiredStoredImageUrlSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.coerce.boolean().default(true),
  placement: z.enum(BANNER_PLACEMENTS, {
    message: "กรุณาเลือกตำแหน่งแบนเนอร์",
  }),
});

export type BannerInput = z.infer<typeof bannerSchema>;
