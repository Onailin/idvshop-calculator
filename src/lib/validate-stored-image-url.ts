import { extractImageKeyFromUrl } from "@/lib/image-url";

/** Stored image URLs must point at this app's S3 keys (proxy or public bucket URL). */
export function isAllowedStoredImageUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  return extractImageKeyFromUrl(url) !== null;
}

export const STORED_IMAGE_URL_ERROR =
  "ลิงก์รูปภาพต้องมาจากระบบอัปโหลดของเว็บไซต์";
