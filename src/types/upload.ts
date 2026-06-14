export const S3_UPLOAD_FOLDERS = [
  "skins",
  "items",
  "packages",
  "banners",
] as const;

export type S3UploadFolder = (typeof S3_UPLOAD_FOLDERS)[number];

export type UploadImageSuccess = {
  success: true;
  url: string;
  key: string;
};

export type UploadImageFailure = {
  success: false;
  error: string;
};

export type UploadImageResponse = UploadImageSuccess | UploadImageFailure;
