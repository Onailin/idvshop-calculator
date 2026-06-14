"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";
import { disableRequestCache } from "@/lib/no-cache";
import { requireAdmin } from "@/lib/auth";
import { messages } from "@/lib/messages";
import { packageSchema } from "@/validators/package";
import type { ActionResult } from "@/types";
import type { PackageInput } from "@/types/package";

function parsePackageFormData(formData: FormData) {
  const topupRaw = formData.get("topupAmount");
  return packageSchema.safeParse({
    buttons: formData.get("buttons"),
    topupAmount:
      topupRaw === null || topupRaw === "" ? null : topupRaw,
    price: formData.get("price"),
    packageGroupId: String(formData.get("packageGroupId") ?? ""),
  });
}

function toPackageData(pkg: {
  id: string;
  buttons: number;
  topupAmount: number | null;
  price: number;
  packageGroupId: string;
  packageGroup: { id: string; name: string; isActive: boolean };
}): PackageInput {
  return {
    id: pkg.id,
    buttons: pkg.buttons,
    topupAmount: pkg.topupAmount,
    price: pkg.price,
    groupId: pkg.packageGroup.id,
    groupName: pkg.packageGroup.name,
  };
}

const packageInclude = {
  packageGroup: {
    select: { id: true, name: true, isActive: true },
  },
} as const;

export async function getPackages() {
  await requireAdmin();
  disableRequestCache();

  const { data } = await safeQuery(
    () =>
      prisma.package.findMany({
        orderBy: [
          { packageGroup: { name: "asc" } },
          { buttons: "asc" },
          { price: "asc" },
        ],
        include: packageInclude,
      }),
    [],
  );

  return data;
}

export async function getPackagesForCalculator(): Promise<PackageInput[]> {
  disableRequestCache();

  const { data } = await safeQuery(
    () =>
      prisma.package.findMany({
        where: { packageGroup: { isActive: true } },
        orderBy: [
          { packageGroup: { name: "asc" } },
          { buttons: "asc" },
          { price: "asc" },
        ],
        include: packageInclude,
      }),
    [],
  );

  return data.map(toPackageData);
}

export async function createPackage(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = parsePackageFormData(formData);
    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const pkg = await prisma.package.create({
      data: parsed.data,
    });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return {
      success: true,
      message: messages.packageCreated,
      data: { id: pkg.id },
    };
  } catch {
    return { success: false, message: messages.packageCreateFailed };
  }
}

export async function updatePackage(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = parsePackageFormData(formData);
    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.package.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return { success: true, message: messages.packageUpdated };
  } catch {
    return { success: false, message: messages.packageUpdateFailed };
  }
}

export async function deletePackage(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.package.delete({ where: { id } });

    revalidatePath("/skins", "layout");
    revalidatePath("/budget", "layout");
    revalidatePath("/admin/packages");

    return { success: true, message: messages.packageDeleted };
  } catch {
    return { success: false, message: messages.packageDeleteFailed };
  }
}
