import type { Role } from "@prisma/client";

export const MAX_ADMINS = 3;

export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export function isStaffRole(role?: string | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN";
}

export function formatRole(role: Role): string {
  const labels: Record<Role, string> = {
    SUPER_ADMIN: "แอดมินหลัก",
    ADMIN: "แอดมิน",
    USER: "ผู้ใช้",
  };
  return labels[role];
}
