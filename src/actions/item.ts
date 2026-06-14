"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";
import { disableRequestCache } from "@/lib/no-cache";
import { requireAdmin } from "@/lib/auth";
import { messages } from "@/lib/messages";
import { sanitizeString } from "@/lib/utils";
import { inferItemTypeFromCategoryName } from "@/lib/item-type";
import { itemSchema } from "@/validators/item";
import { deleteImageFromS3 } from "@/lib/aws/s3-upload";
import type { ActionResult, CalculatorItem } from "@/types";
import type { ItemType } from "@prisma/client";

const MAX_SEARCH_LENGTH = 100;

function normalizeSearch(search?: string): string | undefined {
  if (!search) {
    return undefined;
  }

  const trimmed = search.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, MAX_SEARCH_LENGTH);
}

export async function getItemsForCalculator(
  search?: string,
  categoryId?: string,
  itemType?: ItemType,
): Promise<CalculatorItem[]> {
  disableRequestCache();

  const normalizedSearch = normalizeSearch(search);

  const { data: items } = await safeQuery(
    () =>
      prisma.item.findMany({
        where: {
          ...(normalizedSearch
            ? { name: { contains: normalizedSearch, mode: "insensitive" } }
            : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(itemType ? { type: itemType } : {}),
        },
        include: { category: true },
        orderBy: [{ type: "asc" }, { category: { name: "asc" } }, { name: "asc" }],
      }),
    [],
  );

  return items.map((item: (typeof items)[number]) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    rarity: item.rarity,
    buttonCost: item.buttonCost,
    sendPrice: item.sendPrice,
    topupPrice: item.topupPrice,
    preorderPrice: item.preorderPrice,
    imageUrl: item.imageUrl,
    categoryId: item.categoryId,
    categoryName: item.category.name,
  }));
}

export async function getItemsAdmin() {
  await requireAdmin();

  return prisma.item.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { buttonCost: "desc" }, { name: "asc" }],
  });
}

async function parseItemFormData(formData: FormData, imageUrl?: string) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return {
      success: false as const,
      message: messages.validationFailed,
      errors: { categoryId: ["ไม่พบหมวดหมู่"] },
    };
  }

  const parsed = itemSchema.safeParse({
    name: sanitizeString(String(formData.get("name") ?? "")),
    type: inferItemTypeFromCategoryName(category.name),
    rarity: String(formData.get("rarity") ?? ""),
    buttonCost: formData.get("buttonCost"),
    sendPrice: formData.get("sendPrice"),
    topupPrice: formData.get("topupPrice"),
    preorderPrice: formData.get("preorderPrice"),
    categoryId,
    imageUrl:
      imageUrl !== undefined
        ? imageUrl
        : String(formData.get("imageUrl") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      message: messages.validationFailed,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  return { success: true as const, data: parsed.data };
}

export async function createItem(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = await parseItemFormData(formData);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.message,
        errors: parsed.errors,
      };
    }

    const item = await prisma.item.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        rarity: parsed.data.rarity,
        buttonCost: parsed.data.buttonCost,
        sendPrice: parsed.data.sendPrice,
        topupPrice: parsed.data.topupPrice,
        preorderPrice: parsed.data.preorderPrice,
        categoryId: parsed.data.categoryId,
        imageUrl: parsed.data.imageUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/skins", "layout");
    revalidatePath("/admin/items");

    return {
      success: true,
      message: messages.itemCreated,
      data: { id: item.id },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : messages.itemCreateFailed,
    };
  }
}

export async function updateItem(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: messages.itemNotFound };
    }

    const imageFromForm = formData.get("imageUrl");
    const parsed = await parseItemFormData(
      formData,
      imageFromForm === null ? undefined : String(imageFromForm),
    );

    const nextImageUrl = parsed.success
      ? parsed.data.imageUrl || null
      : existing.imageUrl;

    if (
      parsed.success &&
      existing.imageUrl &&
      existing.imageUrl !== nextImageUrl
    ) {
      await deleteImageFromS3(existing.imageUrl).catch(() => undefined);
    }

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.message,
        errors: parsed.errors,
      };
    }

    await prisma.item.update({
      where: { id },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        rarity: parsed.data.rarity,
        buttonCost: parsed.data.buttonCost,
        sendPrice: parsed.data.sendPrice,
        topupPrice: parsed.data.topupPrice,
        preorderPrice: parsed.data.preorderPrice,
        categoryId: parsed.data.categoryId,
        imageUrl: parsed.data.imageUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/skins", "layout");
    revalidatePath("/admin/items");

    return { success: true, message: messages.itemUpdated };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : messages.itemUpdateFailed,
    };
  }
}

export async function deleteItem(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return { success: false, message: messages.itemNotFound };
    }

    if (item.imageUrl) {
      await deleteImageFromS3(item.imageUrl).catch(() => undefined);
    }

    await prisma.item.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/skins", "layout");
    revalidatePath("/admin/items");

    return { success: true, message: messages.itemDeleted };
  } catch {
    return { success: false, message: messages.itemDeleteFailed };
  }
}
