"use server";

import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";

export async function isDatabaseConnected(): Promise<boolean> {
  const { dbConnected } = await safeQuery(
    async () => prisma.user.count(),
    0,
  );
  return dbConnected;
}
