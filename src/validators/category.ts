import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
