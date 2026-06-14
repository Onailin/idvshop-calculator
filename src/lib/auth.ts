import NextAuth from "next-auth";
import type { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/admin-roles";
import { loginSchema } from "@/validators/auth";
import { isRateLimited, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";

async function getLoginRateLimitKey(username: string): Promise<string> {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      "unknown";

    return `login:${ip}:${username}`;
  } catch {
    return `login:${username}`;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "ชื่อผู้ใช้", type: "text" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;
        const rateLimitKey = await getLoginRateLimitKey(username);

        if (isRateLimited(rateLimitKey)) {
          return null;
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { username },
          });
        } catch (error) {
          console.error("Login database error:", error);
          return null;
        }

        if (!user || !isStaffRole(user.role)) {
          recordFailedAttempt(rateLimitKey);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          recordFailedAttempt(rateLimitKey);
          return null;
        }

        resetRateLimit(rateLimitKey);

        return {
          id: user.id,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});

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
