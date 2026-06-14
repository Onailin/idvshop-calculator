import { handlers } from "@/lib/auth";
import { getAuthEnvStatus } from "@/lib/auth.config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const env = getAuthEnvStatus();

  if (!env.authSecret) {
    return NextResponse.json(
      {
        error: "Configuration",
        message: "AUTH_SECRET missing or too short on Vercel.",
      },
      { status: 503 },
    );
  }

  try {
    return await handlers.GET(request);
  } catch (error) {
    console.error("Auth GET failed:", error);
    return NextResponse.json(
      {
        error: "AuthError",
        message: error instanceof Error ? error.message : String(error),
        env: {
          authUrlCorrect: env.authUrlCorrect,
          resolvedAuthUrl: env.resolvedAuthUrl,
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const env = getAuthEnvStatus();

  if (!env.authSecret) {
    return NextResponse.json(
      {
        error: "Configuration",
        message: "AUTH_SECRET missing or too short on Vercel.",
      },
      { status: 503 },
    );
  }

  try {
    return await handlers.POST(request);
  } catch (error) {
    console.error("Auth POST failed:", error);
    return NextResponse.json(
      {
        error: "AuthError",
        message: error instanceof Error ? error.message : String(error),
        env: {
          authUrlCorrect: env.authUrlCorrect,
          resolvedAuthUrl: env.resolvedAuthUrl,
        },
      },
      { status: 500 },
    );
  }
}
