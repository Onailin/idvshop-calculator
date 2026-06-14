import { getAuthEnvStatus } from "@/lib/auth.config";

export function LoginEnvBanner() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const env = getAuthEnvStatus();
  const issues: string[] = [];

  if (!env.authSecret) {
    issues.push("AUTH_SECRET (อย่างน้อย 32 ตัวอักษร)");
  }
  if (!env.authUrl) {
    issues.push("AUTH_URL");
  } else if (!env.authUrlCorrect) {
    issues.push(
      `AUTH_URL ต้องเป็น https://idvshop-calculator-r2dg.vercel.app (ตอนนี้อาจเป็น localhost)`,
    );
  }
  if (!env.databaseUrl) {
    issues.push("DATABASE_URL");
  }

  if (issues.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <p className="font-semibold">ตั้งค่า Vercel ยังผิด — login จะ error 500</p>
      <ul className="mt-2 list-inside list-disc space-y-0.5">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-destructive/80">
        Vercel → Settings → Environment Variables → แก้ค่า → Redeploy
      </p>
    </div>
  );
}
