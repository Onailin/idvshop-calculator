import { S3_UPLOAD_FOLDERS } from "@/types/upload";

const IMAGE_KEY_PREFIXES = S3_UPLOAD_FOLDERS.map((folder) => `${folder}/`);

export function isS3PublicReadEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_READ === "true" ||
    process.env.AWS_S3_PUBLIC_READ === "true"
  );
}

function getPublicS3BaseUrl(): string | null {
  const base =
    process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL ??
    process.env.AWS_S3_PUBLIC_URL;

  return base?.replace(/\/$/, "") ?? null;
}

/** Parse S3 object key from a stored or proxy URL (works on client + server). */
export function extractImageKeyFromUrl(imageUrl: string): string | null {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("/api/images/")) {
    const key = imageUrl.slice("/api/images/".length);
    return isAllowedImageKey(key) ? key : null;
  }

  try {
    const pathname = new URL(imageUrl).pathname.replace(/^\/+/, "");
    return isAllowedImageKey(pathname) ? pathname : null;
  } catch {
    return null;
  }
}

function isAllowedImageKey(key: string): boolean {
  return IMAGE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function toDirectS3ImageUrl(imageUrl: string): string | null {
  const key = extractImageKeyFromUrl(imageUrl);
  const base = getPublicS3BaseUrl();

  if (!key || !base) {
    return null;
  }

  return `${base}/${key}`;
}

/**
 * Resolve the URL used in <img> / next/image.
 * - Public bucket: direct S3 URL (fast, no Vercel bandwidth)
 * - Private bucket: /api/images/... proxy
 */
export function toDisplayImageSrc(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) {
    return null;
  }

  if (isS3PublicReadEnabled()) {
    return toDirectS3ImageUrl(imageUrl);
  }

  const key = extractImageKeyFromUrl(imageUrl);
  if (key) {
    return `/api/images/${key}`;
  }

  return null;
}
