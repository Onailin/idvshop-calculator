import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getTlsCertificateHelpMessage,
  isTlsCertificateError,
} from "@/lib/aws/s3-http-handler";
import {
  getAwsSignatureHelpMessage,
  isAwsSignatureError,
} from "@/lib/aws/aws-env";
import {
  formatMaxImageFileSizeMb,
  getMaxImageFileSize,
  isS3UploadFolder,
  MAX_ITEM_IMAGE_FILE_SIZE,
  uploadImageToS3,
  validateImageFile,
} from "@/lib/aws/s3-upload";
import type { UploadImageResponse } from "@/types/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "");
    const maxFileSize = isS3UploadFolder(folder)
      ? getMaxImageFileSize(folder)
      : MAX_ITEM_IMAGE_FILE_SIZE;

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > maxFileSize + 1024 * 1024) {
      return NextResponse.json<UploadImageResponse>(
        {
          success: false,
          error: `ขนาดไฟล์ใหญ่เกินกำหนด (สูงสุด ${formatMaxImageFileSizeMb(maxFileSize)}MB)`,
        },
        { status: 413 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json<UploadImageResponse>(
        { success: false, error: "ไม่พบไฟล์รูปภาพในคำขอ" },
        { status: 400 },
      );
    }

    if (!isS3UploadFolder(folder)) {
      return NextResponse.json<UploadImageResponse>(
        {
          success: false,
          error:
            "โฟลเดอร์ไม่ถูกต้อง ใช้ได้เฉพาะ skins, items, packages, banners",
        },
        { status: 400 },
      );
    }

    const validation = validateImageFile(file, folder);
    if (!validation.valid) {
      return NextResponse.json<UploadImageResponse>(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const result = await uploadImageToS3(file, folder);

    return NextResponse.json<UploadImageResponse>({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    if (isAwsSignatureError(error)) {
      console.error("Upload AWS signature error:", error);
      return NextResponse.json<UploadImageResponse>(
        { success: false, error: getAwsSignatureHelpMessage() },
        { status: 403 },
      );
    }

    if (isTlsCertificateError(error)) {
      return NextResponse.json<UploadImageResponse>(
        { success: false, error: getTlsCertificateHelpMessage() },
        { status: 500 },
      );
    }

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json<UploadImageResponse>(
          { success: false, error: error.message },
          { status: 401 },
        );
      }

      if (/[\u0E00-\u0E7F]/.test(error.message)) {
        return NextResponse.json<UploadImageResponse>(
          { success: false, error: error.message },
          { status: 400 },
        );
      }
    }

    console.error("Upload error:", error);
    return NextResponse.json<UploadImageResponse>(
      { success: false, error: "อัปโหลดรูปภาพไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
