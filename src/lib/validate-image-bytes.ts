export type DetectedImageType = "jpeg" | "png" | "webp";

const MIME_TO_DETECTED: Record<string, DetectedImageType> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

function readAscii(buffer: Buffer, start: number, length: number): string {
  return buffer.subarray(start, start + length).toString("ascii");
}

export function detectImageType(buffer: Buffer): DetectedImageType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    readAscii(buffer, 0, 4) === "RIFF" &&
    readAscii(buffer, 8, 4) === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

export function validateImageBytes(
  buffer: Buffer,
  declaredMime: string,
): { valid: true } | { valid: false; error: string } {
  const expected = MIME_TO_DETECTED[declaredMime];
  if (!expected) {
    return { valid: false, error: "ประเภทไฟล์รูปภาพไม่รองรับ" };
  }

  const detected = detectImageType(buffer);
  if (!detected) {
    return {
      valid: false,
      error: "เนื้อหาไฟล์ไม่ตรงกับรูปภาพที่รองรับ",
    };
  }

  if (detected !== expected) {
    return {
      valid: false,
      error: "ประเภทไฟล์ไม่ตรงกับเนื้อหาจริงของรูปภาพ",
    };
  }

  return { valid: true };
}
