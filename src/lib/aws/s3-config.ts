import { S3Client } from "@aws-sdk/client-s3";
import { createS3RequestHandler } from "@/lib/aws/s3-http-handler";

export type AwsS3Config = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
};

let s3Client: S3Client | null = null;

export function getBucketName(): string {
  const bucketName =
    process.env.AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET;

  if (!bucketName) {
    throw new Error(
      "AWS_S3_BUCKET_NAME is not configured. Set AWS_S3_BUCKET_NAME in your environment.",
    );
  }

  return bucketName;
}

export function getAwsS3Config(): AwsS3Config {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = getBucketName();
  const publicUrl = process.env.AWS_S3_PUBLIC_URL;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials are not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
    );
  }

  return {
    region,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

export function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client;
  }

  const config = getAwsS3Config();

  const requestHandler = createS3RequestHandler();

  s3Client = new S3Client({
    region: config.region,
    followRegionRedirects: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    ...(requestHandler ? { requestHandler } : {}),
  });

  return s3Client;
}

export function getPublicObjectUrl(key: string): string {
  const { bucketName, region, publicUrl } = getAwsS3Config();
  const base =
    publicUrl ??
    `https://${bucketName}.s3.${region}.amazonaws.com`;

  return `${base.replace(/\/$/, "")}/${key}`;
}
