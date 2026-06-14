import { handlers } from "@/lib/auth";
import { getAuthEnvStatus } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function missingAuthEnvResponse() {
  return NextResponse.json(
    {
      error: "Configuration",
      message:
        "AUTH_SECRET (32+ characters) and AUTH_URL must be set on Vercel, then redeploy.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  if (!getAuthEnvStatus().authSecret) {
    return missingAuthEnvResponse();
  }

  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (!getAuthEnvStatus().authSecret) {
    return missingAuthEnvResponse();
  }

  return handlers.POST(request);
}
