import type { S3UploadFolder, UploadImageResponse } from "@/types/upload";

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export async function uploadImageViaApi(
  file: File,
  folder: S3UploadFolder,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });

  let payload: UploadImageResponse;

  try {
    payload = (await response.json()) as UploadImageResponse;
  } catch {
    throw new ImageUploadError("ไม่สามารถอ่านผลลัพธ์จากเซิร์ฟเวอร์ได้");
  }

  if (!response.ok || !payload.success) {
    throw new ImageUploadError(
      payload.success ? "อัปโหลดรูปภาพไม่สำเร็จ" : payload.error,
    );
  }

  return payload.url;
}
