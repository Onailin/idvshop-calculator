import { getAuthEnvStatus } from "@/lib/auth.config";

export function LoginEnvBanner() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const env = getAuthEnvStatus();
  const missing: string[] = [];

  if (!env.authSecret) {
    missing.push("AUTH_SECRET (อย่างน้อย 32 ตัวอักษร)");
  }
  if (!env.authUrl) {
    missing.push("AUTH_URL");
  }
  if (!env.databaseUrl) {
    missing.push("DATABASE_URL");
  }

  if (missing.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <p className="font-semibold">ยังตั้งค่า Vercel ไม่ครบ — login จะใช้ไม่ได้</p>
      <p className="mt-1 text-destructive/90">เพิ่ม Environment Variables:</p>
      <ul className="mt-2 list-inside list-disc space-y-0.5">
        {missing.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-destructive/80">
        Vercel → Settings → Environment Variables → ใส่ค่า → Redeploy
      </p>
    </div>
  );
}
