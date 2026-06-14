import { Prisma } from "@prisma/client";

function getNestedError(error: object): unknown {
  const nested = Object.getOwnPropertySymbols(error)
    .map((symbol) => (error as Record<symbol, unknown>)[symbol])
    .find((value): value is Error => value instanceof Error);

  return nested;
}

export function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P1001"
  ) {
    return true;
  }

  // Neon WebSocket adapter surfaces TLS/network failures as ErrorEvent objects.
  if (error && typeof error === "object") {
    const nested = getNestedError(error);
    if (nested instanceof Error) {
      const code = (nested as NodeJS.ErrnoException).code;
      if (
        code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
        code === "ECONNREFUSED" ||
        code === "ENOTFOUND" ||
        code === "ETIMEDOUT"
      ) {
        return true;
      }
    }

    if (
      "clientVersion" in error &&
      !(error instanceof Prisma.PrismaClientKnownRequestError) &&
      !(error instanceof Prisma.PrismaClientValidationError) &&
      getNestedError(error) instanceof Error
    ) {
      return true;
    }
  }

  return false;
}

export async function safeQuery<T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; dbConnected: boolean }> {
  try {
    const data = await query();
    return { data, dbConnected: true };
  } catch (error) {
    if (isDbConnectionError(error)) {
      return { data: fallback, dbConnected: false };
    }
    throw error;
  }
}
