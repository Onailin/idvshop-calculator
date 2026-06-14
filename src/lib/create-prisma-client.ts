import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

function shouldUseNeonAdapter(connectionString?: string): boolean {
  if (process.env.USE_NEON_ADAPTER !== "true") {
    return false;
  }

  return Boolean(connectionString?.includes("neon.tech"));
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
