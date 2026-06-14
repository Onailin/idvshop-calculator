import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { extractImageKeyFromUrl } from "@/lib/image-url";
import { validateImageBytes } from "@/lib/validate-image-bytes";
import {
  getBucketName,
  getPublicObjectUrl,
  getS3Client,
} from "@/lib/aws/s3-config";
import type { S3UploadFolder } from "@/types/upload";
import { S3_UPLOAD_FOLDERS } from "@/types/upload";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ITEM_IMAGE_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ITEM_UPLOAD_FOLDERS = new Set<S3UploadFolder>(["skins", "items"]);

export function getMaxImageFileSize(folder?: S3UploadFolder): number {
  if (folder && ITEM_UPLOAD_FOLDERS.has(folder)) {
    return MAX_ITEM_IMAGE_FILE_SIZE;
  }
  return MAX_IMAGE_FILE_SIZE;
}

export function formatMaxImageFileSizeMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export type UploadValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export type UploadImageResult = {
  url: string;
  key: string;
};

function normalizeFolder(folder: S3UploadFolder): string {
  return folder.replace(/^\/+|\/+$/g, "");
}

function resolveExtension(file: File): string | null {
  const mimeExtension = MIME_TO_EXTENSION[file.type];
  const nameExtension = file.name.split(".").pop()?.toLowerCase();

  if (!mimeExtension || !nameExtension) {
    return null;
  }

  if (!ALLOWED_EXTENSIONS.has(nameExtension)) {
    return null;
  }

  if (file.type === "image/jpeg" && !["jpg", "jpeg"].includes(nameExtension)) {
    return null;
  }

  if (file.type !== "image/jpeg" && nameExtension !== mimeExtension) {
    return null;
  }

  return mimeExtension;
}

export function isS3UploadFolder(value: string): value is S3UploadFolder {
  return (S3_UPLOAD_FOLDERS as readonly string[]).includes(value);
}

export function validateImageFile(
  file: File,
  folder?: S3UploadFolder,
): UploadValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "รองรับเฉพาะไฟล์รูป JPG, JPEG, PNG และ WebP",
    };
  }

  const extension = resolveExtension(file);
  if (!extension) {
    return {
      valid: false,
      error: "นามสกุลไฟล์ไม่ตรงกับประเภทรูปภาพ",
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: "ไฟล์รูปภาพว่างเปล่า" };
  }

  const maxSize = getMaxImageFileSize(folder);
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ขนาดรูปต้องไม่เกิน ${formatMaxImageFileSizeMb(maxSize)}MB`,
    };
  }

  return { valid: true };
}

export function buildS3ObjectKey(
  folder: S3UploadFolder,
  extension: string,
): string {
  const normalizedFolder = normalizeFolder(folder);
  return `${normalizedFolder}/${randomUUID()}.${extension}`;
}

export function extractS3KeyFromUrl(imageUrl: string): string | null {
  const key = extractImageKeyFromUrl(imageUrl);
  if (key) {
    return key;
  }

  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname.replace(/^\/+/, "");

    if (!pathname) {
      return null;
    }

    const bucketName = getBucketName();
    const host = url.hostname;

    if (host === `${bucketName}.s3.amazonaws.com`) {
      return pathname;
    }

    const regionalHostMatch = host.match(
      new RegExp(`^${bucketName}\\.s3[.-][a-z0-9-]+\\.amazonaws\\.com$`),
    );
    if (regionalHostMatch) {
      return pathname;
    }

    const publicBase = process.env.AWS_S3_PUBLIC_URL?.replace(/\/$/, "");
    if (publicBase && imageUrl.startsWith(`${publicBase}/`)) {
      return imageUrl.slice(publicBase.length + 1);
    }

    return null;
  } catch {
    return null;
  }
}

export async function uploadImageToS3(
  file: File,
  folder: S3UploadFolder,
): Promise<UploadImageResult> {
  const validation = validateImageFile(file, folder);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const extension = resolveExtension(file);
  if (!extension) {
    throw new Error("นามสกุลไฟล์ไม่ถูกต้อง");
  }

  const key = buildS3ObjectKey(folder, extension);
  const buffer = Buffer.from(await file.arrayBuffer());
  const byteValidation = validateImageBytes(buffer, file.type);
  if (!byteValidation.valid) {
    throw new Error(byteValidation.error);
  }

  const client = getS3Client();

  // Modern S3 buckets often disable ACLs (Object Ownership: Bucket owner enforced).
  // Public access is handled via bucket policy instead of per-object ACL.
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: getPublicObjectUrl(key),
  };
}

export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  const key = extractS3KeyFromUrl(imageUrl);
  if (!key) {
    return;
  }

  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
}
