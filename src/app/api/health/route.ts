import { NextResponse } from "next/server";
import { getAuthEnvStatus } from "@/lib/auth.config";

export const runtime = "nodejs";

export async function GET() {
  const checks = getAuthEnvStatus();
  let authModuleOk = false;
  let authModuleError: string | null = null;

  try {
    const { handlers } = await import("@/lib/auth");
    authModuleOk = typeof handlers.GET === "function" && typeof handlers.POST === "function";
  } catch (error) {
    authModuleError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json({
    ok: checks.authSecret && checks.authUrl && checks.databaseUrl && authModuleOk,
    checks: {
      ...checks,
      authModuleOk,
      authModuleError,
    },
  });
}
