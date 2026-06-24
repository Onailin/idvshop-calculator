"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";
import { disableRequestCache } from "@/lib/no-cache";
import { requireAdmin } from "@/lib/auth";
import { sanitizeString } from "@/lib/utils";
import { messages } from "@/lib/messages";
import { categorySchema } from "@/validators/category";
import type { ActionResult } from "@/types";

export async function getCategories(options?: { orderBy?: "name" | "newest" }) {
  disableRequestCache();

  const orderBy =
    options?.orderBy === "newest"
      ? { createdAt: "desc" as const }
      : { name: "asc" as const };

  const { data } = await safeQuery(
    () =>
      prisma.category.findMany({
        orderBy,
        include: {
          _count: { select: { items: true } },
        },
      }),
    [],
  );

  return data;
}

export async function createCategory(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse({
      name: sanitizeString(String(formData.get("name") ?? "")),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const category = await prisma.category.create({
      data: { name: parsed.data.name },
    });

    revalidatePath("/");
    revalidatePath("/skins", "layout");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: messages.categoryCreated,
      data: { id: category.id },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, message: messages.categoryExists };
    }
    return { success: false, message: messages.categoryCreateFailed };
  }
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse({
      name: sanitizeString(String(formData.get("name") ?? "")),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.category.update({
      where: { id },
      data: { name: parsed.data.name },
    });

    revalidatePath("/");
    revalidatePath("/skins", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: messages.categoryUpdated };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, message: messages.categoryExists };
    }
    return { success: false, message: messages.categoryUpdateFailed };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.category.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/skins", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: messages.categoryDeleted };
  } catch {
    return { success: false, message: messages.categoryDeleteFailed };
  }
}
