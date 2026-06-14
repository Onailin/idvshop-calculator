export {
  getAwsS3Config,
  getBucketName,
  getPublicObjectUrl,
  getS3Client,
} from "@/lib/aws/s3-config";
export {
  buildS3ObjectKey,
  deleteImageFromS3,
  extractS3KeyFromUrl,
  isS3UploadFolder,
  MAX_IMAGE_FILE_SIZE,
  uploadImageToS3,
  validateImageFile,
} from "@/lib/aws/s3-upload";
export type { UploadImageResult, UploadValidationResult } from "@/lib/aws/s3-upload";
