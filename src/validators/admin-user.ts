import { z } from "zod";
import { loginSchema, adminPasswordSchema } from "@/validators/auth";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: adminPasswordSchema,
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createAdminSchema = loginSchema.extend({
  password: adminPasswordSchema,
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
