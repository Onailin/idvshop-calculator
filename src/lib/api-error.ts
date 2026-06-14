export function toClientErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return error.message;
    }
  }

  return fallback;
}
