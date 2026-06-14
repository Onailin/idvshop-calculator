import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { toClientErrorMessage } from "@/lib/api-error";
import { getBucketName, getS3Client } from "@/lib/aws/s3-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PREFIXES = ["skins/", "items/", "packages/", "banners/"];

function isAllowedKey(key: string): boolean {
  if (key.includes("..") || key.includes("\\")) {
    return false;
  }

  return ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  try {
    const { key: keyParts } = await context.params;
    const key = keyParts.map(decodeURIComponent).join("/");

    if (!key || !isAllowedKey(key)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const response = await getS3Client().send(
      new GetObjectCommand({
        Bucket: getBucketName(),
        Key: key,
      }),
    );

    if (!response.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await response.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": response.ContentType ?? "application/octet-stream",
        "Cache-Control":
          response.CacheControl ?? "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image not found";
    const status = message.includes("NoSuchKey") ? 404 : 500;

    if (status === 500) {
      console.error("Image proxy error:", error);
      return NextResponse.json(
        {
          error: toClientErrorMessage(error, "Failed to load image from S3"),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
