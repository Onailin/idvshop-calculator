import { isStaffRole } from "@/lib/admin-roles";
import { loginSchema } from "@/validators/auth";
import { isRateLimited, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";

function getLoginRateLimitKey(username: string): string {
  return `login:${username}`;
}

export async function authorizeCredentials(
  credentials: Partial<Record<"username" | "password", unknown>>,
) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return null;
  }

  const { username, password } = parsed.data;
  const rateLimitKey = getLoginRateLimitKey(username);

  if (isRateLimited(rateLimitKey)) {
    return null;
  }

  const { prisma } = await import("@/lib/prisma");
  const bcrypt = await import("bcryptjs");

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
}
