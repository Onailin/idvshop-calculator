import { z } from "zod";

export const packageGroupSchema = z.object({
  name: z
    .string()
    .min(1, "กรุณากรอกชื่อกลุ่มแพ็กเกจ")
    .max(100, "ชื่อกลุ่มต้องไม่เกิน 100 ตัวอักษร"),
  isActive: z.coerce.boolean().optional(),
});

export type PackageGroupFormInput = z.infer<typeof packageGroupSchema>;
