import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authorizeCredentials } from "@/lib/auth-credentials";

export function getAuthSecret(): string | undefined {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    undefined
  );
}

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "ชื่อผู้ใช้", type: "text" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      authorize: authorizeCredentials,
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
} satisfies NextAuthConfig;

export function getAuthEnvStatus() {
  const secret = getAuthSecret();
  return {
    authSecret: Boolean(secret && secret.length >= 32),
    authUrl: Boolean(process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim()),
    databaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
  };
}
