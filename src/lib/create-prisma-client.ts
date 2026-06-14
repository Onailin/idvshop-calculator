import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

function isNeonUrl(connectionString?: string): boolean {
  return Boolean(connectionString?.includes("neon.tech"));
}

function isPooledNeonUrl(connectionString?: string): boolean {
  return Boolean(connectionString?.includes("-pooler."));
}

/** Prefer Neon pooler on serverless — works with the default Prisma TCP driver. */
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

  if (isPooledNeonUrl(connectionString)) {
    return false;
  }

  return process.env.USE_NEON_ADAPTER === "true";
}

export function getPrismaAdapterMode(connectionString?: string): "neon" | "direct" {
  return shouldUseNeonAdapter(connectionString) ? "neon" : "direct";
}

export function createPrismaClient(): PrismaClient {
  const connectionString = resolveDatabaseUrl(process.env.DATABASE_URL);

  if (connectionString && shouldUseNeonAdapter(connectionString)) {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({
    datasources: connectionString
      ? { db: { url: connectionString } }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
