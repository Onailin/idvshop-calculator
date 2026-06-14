import { z } from "zod";
import {
  isAllowedStoredImageUrl,
  STORED_IMAGE_URL_ERROR,
} from "@/lib/validate-stored-image-url";

export const optionalStoredImageUrlSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || isAllowedStoredImageUrl(value), {
    message: STORED_IMAGE_URL_ERROR,
  });

export const requiredStoredImageUrlSchema = z
  .string()
  .min(1, "กรุณาอัปโหลดรูปภาพ")
  .refine(isAllowedStoredImageUrl, {
    message: STORED_IMAGE_URL_ERROR,
  });
