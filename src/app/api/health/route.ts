import { NextResponse } from "next/server";
import { getAuthEnvStatus } from "@/lib/auth.config";

export const runtime = "nodejs";

export async function GET() {
  const auth = getAuthEnvStatus();

  return NextResponse.json({
    ok: auth.authSecret && auth.authUrl && auth.databaseUrl,
    checks: auth,
  });
}
