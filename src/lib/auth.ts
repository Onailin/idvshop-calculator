import NextAuth from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/admin-roles";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

async function resolveStaffSession(session: Session | null): Promise<Session | null> {
  if (!session?.user?.id) {
    return null;
  }

  let user: { role: string; username: string } | null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, username: true },
    });
  } catch (error) {
    console.error("Session verification database error:", error);
    return null;
  }

  if (!user || !isStaffRole(user.role)) {
    return null;
  }

  session.user.role = user.role;
  session.user.name = user.username;
  return session;
}

export async function getStaffSession(): Promise<Session | null> {
  try {
    const session = await auth();
    return resolveStaffSession(session);
  } catch (error) {
    console.error("Session lookup failed:", error);
    return null;
  }
}

export async function requireStaff(): Promise<Session> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireStaff();
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export const requireAdmin = requireStaff;
