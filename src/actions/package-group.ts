"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";
import { disableRequestCache } from "@/lib/no-cache";
import { requireAdmin } from "@/lib/auth";
import { sanitizeString } from "@/lib/utils";
import { messages } from "@/lib/messages";
import { packageGroupSchema } from "@/validators/package-group";
import type { ActionResult } from "@/types";
import type { PackageGroupOption } from "@/types/package";

export async function getPackageGroups() {
  await requireAdmin();

  const { data } = await safeQuery(
    () =>
      prisma.packageGroup.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { packages: true } },
        },
      }),
    [],
  );

  return data;
}

export async function getActivePackageGroupsForCalculator(): Promise<PackageGroupOption[]> {
  disableRequestCache();

  const { data } = await safeQuery(
    () =>
      prisma.packageGroup.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, isActive: true },
      }),
    [],
  );

  return data;
}

export async function createPackageGroup(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = packageGroupSchema.safeParse({
      name: sanitizeString(String(formData.get("name") ?? "")),
      isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    });

    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const group = await prisma.packageGroup.create({
      data: {
        name: parsed.data.name,
        isActive: parsed.data.isActive ?? true,
      },
    });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return {
      success: true,
      message: messages.packageGroupCreated,
      data: { id: group.id },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, message: messages.packageGroupExists };
    }
    return { success: false, message: messages.packageGroupCreateFailed };
  }
}

export async function updatePackageGroup(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = packageGroupSchema.safeParse({
      name: sanitizeString(String(formData.get("name") ?? "")),
      isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    });

    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.packageGroup.update({
      where: { id },
      data: {
        name: parsed.data.name,
        isActive: parsed.data.isActive ?? true,
      },
    });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return { success: true, message: messages.packageGroupUpdated };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, message: messages.packageGroupExists };
    }
    return { success: false, message: messages.packageGroupUpdateFailed };
  }
}

export async function togglePackageGroupActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.packageGroup.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return {
      success: true,
      message: isActive
        ? messages.packageGroupEnabled
        : messages.packageGroupDisabled,
    };
  } catch {
    return { success: false, message: messages.packageGroupUpdateFailed };
  }
}

export async function deletePackageGroup(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.packageGroup.delete({ where: { id } });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return { success: true, message: messages.packageGroupDeleted };
  } catch {
    return { success: false, message: messages.packageGroupDeleteFailed };
  }
}
