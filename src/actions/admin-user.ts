"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MAX_ADMINS, STAFF_ROLES } from "@/lib/admin-roles";
import { requireStaff, requireSuperAdmin } from "@/lib/auth";
import { sanitizeString } from "@/lib/utils";
import { messages } from "@/lib/messages";
import {
  changePasswordSchema,
  createAdminSchema,
} from "@/validators/admin-user";
import type { ActionResult } from "@/types";

export type AdminUserListItem = {
  id: string;
  username: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: Date;
};

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  await requireSuperAdmin();

  return prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  }) as Promise<AdminUserListItem[]>;
}

export async function createAdminUser(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();

    const parsed = createAdminSchema.safeParse({
      username: sanitizeString(String(formData.get("username") ?? "")),
      password: String(formData.get("password") ?? ""),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const adminCount = await prisma.user.count({
      where: { role: { in: STAFF_ROLES } },
    });

    if (adminCount >= MAX_ADMINS) {
      return {
        success: false,
        message: `${messages.adminMaxReached} (${MAX_ADMINS} คน)`,
      };
    }

    const existing = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });

    if (existing) {
      return { success: false, message: messages.adminExists };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        role: "ADMIN",
      },
    });

    revalidatePath("/admin/admins");

    return {
      success: true,
      message: messages.adminCreated,
      data: { id: user.id },
    };
  } catch {
    return { success: false, message: messages.adminCreateFailed };
  }
}

export async function deleteAdminUser(id: string): Promise<ActionResult> {
  try {
    const session = await requireSuperAdmin();

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return { success: false, message: messages.adminNotFound };
    }

    if (user.role === "SUPER_ADMIN") {
      return { success: false, message: messages.cannotDeleteMainAdmin };
    }

    if (user.id === session.user.id) {
      return { success: false, message: messages.cannotDeleteSelf };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/admins");

    return { success: true, message: messages.adminDeleted };
  } catch {
    return { success: false, message: messages.adminDeleteFailed };
  }
}

export async function changeOwnPassword(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireStaff();

    const parsed = changePasswordSchema.safeParse({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword: String(formData.get("newPassword") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, message: messages.userNotFound };
    }

    const isValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      return { success: false, message: messages.currentPasswordWrong };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: messages.passwordChanged };
  } catch {
    return { success: false, message: messages.passwordChangeFailed };
  }
}
