import { z } from "zod";
import { optionalStoredImageUrlSchema } from "@/validators/stored-image-url";

export const packageSchema = z.object({
  buttons: z.coerce
    .number()
    .int("จำนวนกระดุมต้องเป็นจำนวนเต็ม")
    .positive("จำนวนกระดุมต้องมากกว่า 0"),
  topupAmount: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null()])
    .optional()
    .transform((value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    }),
  price: z.coerce
    .number()
    .int("ราคาต้องเป็นจำนวนเต็ม")
    .positive("ราคาต้องมากกว่า 0"),
  packageGroupId: z.string().min(1, "กรุณาเลือกกลุ่มแพ็กเกจ"),
  imageUrl: optionalStoredImageUrlSchema,
});

export type PackageFormInput = z.infer<typeof packageSchema>;
