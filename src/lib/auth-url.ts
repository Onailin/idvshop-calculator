/** Resolve the public site URL for Auth.js (must not be localhost on Vercel). */
export function resolveAuthUrl(): string {
  const explicit =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || "";

  if (
    explicit &&
    !explicit.includes("localhost") &&
    !explicit.includes("127.0.0.1")
  ) {
    return explicit.replace(/\/$/, "");
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return explicit || "http://localhost:3000";
}

export function isAuthUrlMisconfigured(): boolean {
  if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
    return false;
  }

  const explicit =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || "";

  if (!explicit) {
    return true;
  }

  return (
    explicit.includes("localhost") ||
    explicit.includes("127.0.0.1") ||
    !explicit.startsWith("https://")
  );
}
