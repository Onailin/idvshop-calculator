import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

function shouldUseNeonAdapter(connectionString?: string): boolean {
  if (process.env.USE_NEON_ADAPTER === "false") {
    return false;
  }

  const isNeonUrl = Boolean(connectionString?.includes("neon.tech"));
  if (!isNeonUrl) {
    return false;
  }

  if (process.env.USE_NEON_ADAPTER === "true") {
    return true;
  }

  // Serverless hosts (e.g. Vercel) cannot use raw TCP to Neon; use the adapter.
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  // Opt-in WebSocket adapter for edge/serverless where TCP 5432 is blocked.
  // Local Node.js should use the default driver (avoids TLS issues with some networks).
  if (connectionString && shouldUseNeonAdapter(connectionString)) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
