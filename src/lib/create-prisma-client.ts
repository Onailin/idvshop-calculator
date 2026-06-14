import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

function isNeonUrl(connectionString?: string): boolean {
  return Boolean(connectionString?.includes("neon.tech"));
}

function isPooledNeonUrl(connectionString?: string): boolean {
  return Boolean(connectionString?.includes("-pooler."));
}

/** Prefer Neon pooler on serverless TCP — not used when WebSocket adapter is active. */
export function resolveDatabaseUrl(connectionString?: string): string | undefined {
  if (!connectionString || !isNeonUrl(connectionString) || isPooledNeonUrl(connectionString)) {
    return connectionString;
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return connectionString.replace(/(@ep-[^.\/]+)(\.)/, "$1-pooler$2");
  }

  return connectionString;
}

function shouldUseNeonAdapter(connectionString?: string): boolean {
  if (process.env.USE_NEON_ADAPTER === "false") {
    return false;
  }

  if (!isNeonUrl(connectionString)) {
    return false;
  }

  if (process.env.USE_NEON_ADAPTER === "true") {
    return true;
  }

  // Vercel serverless: WebSocket driver is more reliable than raw TCP.
  return process.env.VERCEL === "1";
}

export function getPrismaAdapterMode(connectionString?: string): "neon" | "direct" {
  return shouldUseNeonAdapter(connectionString) ? "neon" : "direct";
}

export function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;

  if (rawUrl && shouldUseNeonAdapter(rawUrl)) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString: rawUrl });
    return new PrismaClient({ adapter });
  }

  const connectionString = resolveDatabaseUrl(rawUrl);

  return new PrismaClient({
    datasources: connectionString
      ? { db: { url: connectionString } }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
