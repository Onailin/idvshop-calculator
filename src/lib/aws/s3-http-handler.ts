import https from "node:https";
import { NodeHttpHandler } from "@smithy/node-http-handler";

/**
 * Windows / corporate networks sometimes intercept HTTPS (antivirus, proxy),
 * which makes Node fail with "unable to verify the first certificate".
 * Set AWS_S3_TLS_INSECURE=true in development only when you hit that error.
 */
export function isS3TlsInsecureEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.AWS_S3_TLS_INSECURE === "true"
  );
}

export function createS3RequestHandler(): NodeHttpHandler | undefined {
  if (!isS3TlsInsecureEnabled()) {
    return undefined;
  }

  return new NodeHttpHandler({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
}

export function isTlsCertificateError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("unable to verify the first certificate") ||
    message.includes("self signed certificate") ||
    message.includes("certificate has expired")
  );
}

export function getTlsCertificateHelpMessage(): string {
  return "ไม่สามารถเชื่อมต่อ AWS S3 ได้ (ปัญหา SSL certificate) — ในโหมด development ให้ตั้ง AWS_S3_TLS_INSECURE=true ใน .env แล้วรีสตาร์ทเซิร์ฟเวอร์ หรือปิด SSL scanning ของ antivirus/proxy";
}
