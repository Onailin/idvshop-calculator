const PLACEHOLDER_AUTH_SECRETS = new Set([
  "generate-with: openssl rand -base64 32",
  "your-auth-secret",
  "changeme",
]);

const PLACEHOLDER_AWS_KEYS = new Set([
  "your-access-key",
  "your-secret-key",
]);

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const errors: string[] = [];

  const authSecret = process.env.AUTH_SECRET?.trim() ?? "";
  if (authSecret.length < 32) {
    errors.push("AUTH_SECRET must be at least 32 characters in production");
  }
  if (PLACEHOLDER_AUTH_SECRETS.has(authSecret)) {
    errors.push("AUTH_SECRET is still using a placeholder value");
  }

  if (!process.env.AUTH_URL?.trim()) {
    errors.push("AUTH_URL must be set to your production site URL");
  }

  if (!process.env.DATABASE_URL?.trim()) {
    errors.push("DATABASE_URL must be set in production");
  }

  const accessKey = process.env.AWS_ACCESS_KEY_ID?.trim() ?? "";
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "";
  if (!accessKey || PLACEHOLDER_AWS_KEYS.has(accessKey)) {
    errors.push("AWS_ACCESS_KEY_ID must be configured with real credentials");
  }
  if (!secretKey || PLACEHOLDER_AWS_KEYS.has(secretKey)) {
    errors.push("AWS_SECRET_ACCESS_KEY must be configured with real credentials");
  }

  if (!process.env.AWS_S3_BUCKET_NAME?.trim()) {
    errors.push("AWS_S3_BUCKET_NAME must be set in production");
  }

  if (process.env.AWS_S3_TLS_INSECURE === "true") {
    errors.push("AWS_S3_TLS_INSECURE must not be true in production");
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid production environment:\n- ${errors.join("\n- ")}`,
    );
  }
}
