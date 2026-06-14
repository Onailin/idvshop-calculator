import { createPrismaClient, getPrismaAdapterMode } from "@/lib/create-prisma-client";

function getPrismaCacheKey(): string {
  const connectionString = process.env.DATABASE_URL;
  return `${getPrismaAdapterMode(connectionString)}:${connectionString ?? ""}`;
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

globalForPrisma.prisma = prisma;
globalForPrisma.prismaCacheKey = prismaCacheKey;
