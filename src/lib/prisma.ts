import { createPrismaClient } from "@/lib/create-prisma-client";

function getPrismaCacheKey(): string {
  const adapter = process.env.USE_NEON_ADAPTER === "true" ? "neon" : "direct";
  return `${adapter}:${process.env.DATABASE_URL ?? ""}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  prismaCacheKey: string | undefined;
};

const prismaCacheKey = getPrismaCacheKey();

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaCacheKey !== prismaCacheKey
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaCacheKey = prismaCacheKey;
}
