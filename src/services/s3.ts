/**
 * @deprecated Import from `@/lib/aws` instead.
 * Re-exports kept for backward compatibility.
 */
export {
  deleteImageFromS3,
  MAX_IMAGE_FILE_SIZE,
  uploadImageToS3,
  validateImageFile,
} from "@/lib/aws/s3-upload";
export type {
  UploadImageResult,
  UploadValidationResult,
} from "@/lib/aws/s3-upload";
