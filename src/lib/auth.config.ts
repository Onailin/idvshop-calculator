import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/admin-roles";
import { loginSchema } from "@/validators/auth";
import { isRateLimited, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";

function getAuthSecret(): string | undefined {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    undefined
  );
}

function getLoginRateLimitKey(username: string): string {
  return `login:${username}`;
}

export const authConfig = {
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
        const rateLimitKey = getLoginRateLimitKey(username);

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
    error: "/login",
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
  secret: getAuthSecret(),
} satisfies NextAuthConfig;

export function getAuthEnvStatus() {
  const secret = getAuthSecret();
  return {
    authSecret: Boolean(secret && secret.length >= 32),
    authUrl: Boolean(process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim()),
    databaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
  };
}
