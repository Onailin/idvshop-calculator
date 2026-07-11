import { z } from "zod";

const packageSelectionSchema = z.object({
  packageId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
});

const selectedItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
});

const selectedItemsSchema = z.array(selectedItemSchema).max(100).optional();

const couponInventorySchema = z.object({
  discount10: z.number().int().min(0).max(999),
  discount3: z.number().int().min(0).max(999),
});

export const createCombinationOrderSchema = z.object({
  kind: z.literal("combination"),
  channel: z.enum(["FACEBOOK", "LINE"]),
  groupId: z.string().min(1),
  items: z.array(packageSelectionSchema).min(1).max(50),
  selectedItems: selectedItemsSchema,
});

export const createCouponOrderSchema = z.object({
  kind: z.literal("coupon"),
  channel: z.enum(["FACEBOOK", "LINE"]),
  selections: z.array(packageSelectionSchema).min(1).max(50),
  inventory: couponInventorySchema,
  selectedItems: selectedItemsSchema,
});

export const createOrderSchema = z.discriminatedUnion("kind", [
  createCombinationOrderSchema,
  createCouponOrderSchema,
]);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderStatusFilterSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "ALL",
]);

export const clearOrdersSchema = z
  .array(z.string().min(1))
  .min(1, "กรุณาเลือกออเดอร์อย่างน้อย 1 รายการ")
  .max(200);
