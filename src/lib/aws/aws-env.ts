/** Trim and strip accidental quotes from Vercel env paste. */
export function sanitizeAwsEnvValue(value?: string): string {
  if (!value) {
    return "";
  }

  let cleaned = value.trim();

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

export function getAwsEnvStatus() {
  const accessKeyId = sanitizeAwsEnvValue(process.env.AWS_ACCESS_KEY_ID);
  const secretAccessKey = sanitizeAwsEnvValue(process.env.AWS_SECRET_ACCESS_KEY);
  const region = sanitizeAwsEnvValue(process.env.AWS_REGION);
  const bucket =
    sanitizeAwsEnvValue(process.env.AWS_S3_BUCKET_NAME) ||
    sanitizeAwsEnvValue(process.env.AWS_S3_BUCKET);

  return {
    accessKeyId: Boolean(accessKeyId),
    secretAccessKey: Boolean(secretAccessKey),
    secretLength: secretAccessKey.length,
    region: Boolean(region),
    regionValue: region || null,
    bucket: Boolean(bucket),
    bucketValue: bucket || null,
    publicUrl: Boolean(sanitizeAwsEnvValue(process.env.AWS_S3_PUBLIC_URL)),
  };
}

export function isAwsSignatureError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const name = "name" in error ? String(error.name) : "";
  const code = "Code" in error ? String(error.Code) : "";
  const message = "message" in error ? String(error.message) : "";

  return (
    name === "SignatureDoesNotMatch" ||
    code === "SignatureDoesNotMatch" ||
    message.includes("SignatureDoesNotMatch")
  );
}

export function getAwsSignatureHelpMessage(): string {
  return "AWS credentials บน Vercel ไม่ถูกต้อง — ลบ AWS_ACCESS_KEY_ID และ AWS_SECRET_ACCESS_KEY แล้วใส่ใหม่ (ไม่ใส่เครื่องหมาย \"\") จาก IAM → Users → Security credentials → Create access key แล้ว Redeploy";
}
