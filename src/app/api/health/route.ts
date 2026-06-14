import { NextRequest, NextResponse } from "next/server";
import { getAuthEnvStatus } from "@/lib/auth.config";
import { getAwsEnvStatus } from "@/lib/aws/aws-env";
import { getBucketName, getS3Client } from "@/lib/aws/s3-config";
import { HeadBucketCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const checks = getAuthEnvStatus();
  let authModuleOk = false;
  let authModuleError: string | null = null;
  let authProvidersStatus: number | null = null;
  let authProvidersBody: unknown = null;

  try {
    const { handlers } = await import("@/lib/auth");
    authModuleOk =
      typeof handlers.GET === "function" && typeof handlers.POST === "function";

    if (authModuleOk) {
      const testUrl = new URL("/api/auth/providers", request.url);
      const response = await handlers.GET(
        new NextRequest(testUrl, { method: "GET" }),
      );
      authProvidersStatus = response.status;
      authProvidersBody = await response.clone().json().catch(() => null);
    }
  } catch (error) {
    authModuleError = error instanceof Error ? error.message : String(error);
  }

  let dbOk = false;
  let dbError: string | null = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.count();
    dbOk = true;
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  }

  const aws = getAwsEnvStatus();
  let s3Ok = false;
  let s3Error: string | null = null;
  try {
    if (aws.accessKeyId && aws.secretAccessKey && aws.region && aws.bucket) {
      const client = getS3Client();
      await client.send(new HeadBucketCommand({ Bucket: getBucketName() }));
      s3Ok = true;
    } else {
      s3Error = "AWS env variables incomplete";
    }
  } catch (error) {
    s3Error = error instanceof Error ? error.message : String(error);
  }

  const ok =
    checks.authSecret &&
    checks.databaseUrl &&
    checks.authUrlCorrect &&
    authModuleOk &&
    authProvidersStatus === 200 &&
    dbOk &&
    s3Ok;

  return NextResponse.json({
    ok,
    checks: {
      ...checks,
      authModuleOk,
      authModuleError,
      authProvidersStatus,
      authProvidersBody,
      dbOk,
      dbError,
      aws,
      s3Ok,
      s3Error,
    },
  });
}
