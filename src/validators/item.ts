import { z } from "zod";
import { ITEM_TYPES } from "@/lib/item-type";
import { RARITIES } from "@/lib/rarity";
import { optionalStoredImageUrlSchema } from "@/validators/stored-image-url";

function optionalBahtField() {
  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    },
    z.coerce
      .number()
      .int("ราคาต้องเป็นจำนวนเต็ม")
      .min(0, "ราคาต้องไม่ติดลบ")
      .max(999_999, "ราคาสูงเกินไป")
      .nullable(),
  );
}

export const itemSchema = z.object({
  name: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(150, "ชื่อต้องไม่เกิน 150 ตัวอักษร"),
  type: z.enum(ITEM_TYPES, {
    message: "กรุณาเลือกประเภทที่ถูกต้อง",
  }),
  rarity: z.enum(RARITIES, {
    message: "กรุณาเลือกระดับความหายากที่ถูกต้อง",
  }),
  buttonCost: z.coerce
    .number()
    .int("จำนวนกระดุมต้องเป็นจำนวนเต็ม")
    .min(1, "จำนวนกระดุมต้องอย่างน้อย 1")
    .max(999_999, "จำนวนกระดุมสูงเกินไป"),
  sendPrice: optionalBahtField(),
  topupPrice: optionalBahtField(),
  preorderPrice: optionalBahtField(),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  imageUrl: optionalStoredImageUrlSchema,
});

export type ItemInput = z.infer<typeof itemSchema>;
