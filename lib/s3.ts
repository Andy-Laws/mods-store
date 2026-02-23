import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_REGION = process.env.S3_REGION ?? "auto";
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET;
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL?.replace(/\/$/, "") ?? "";
const S3_PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET;

export function isS3Configured(): boolean {
  return !!(
    S3_ENDPOINT &&
    S3_ACCESS_KEY_ID &&
    S3_SECRET_ACCESS_KEY &&
    S3_PUBLIC_BUCKET &&
    S3_PUBLIC_URL &&
    S3_PRIVATE_BUCKET
  );
}

function getClient(): S3Client {
  if (!S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new Error("S3 is not configured (missing endpoint or credentials)");
  }
  return new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function uniqueId(): string {
  return `${Date.now()}-${randomBytes(4).toString("hex")}`;
}

/**
 * Upload to the public bucket. Returns full public URL.
 */
export async function uploadPublic(
  body: Buffer | Uint8Array,
  pathPrefix: string,
  filename: string,
  contentType?: string
): Promise<string> {
  const client = getClient();
  if (!S3_PUBLIC_BUCKET || !S3_PUBLIC_URL) {
    throw new Error("S3 public bucket or S3_PUBLIC_URL not configured");
  }
  const safeName = sanitize(filename);
  const key = `${pathPrefix}/${uniqueId()}-${safeName}`;
  await client.send(
    new PutObjectCommand({
      Bucket: S3_PUBLIC_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType ?? undefined,
    })
  );
  return `${S3_PUBLIC_URL}/${key}`;
}

/**
 * Upload to the private bucket. Returns object key only (e.g. product-files/xxx/filename).
 */
export async function uploadPrivate(
  body: Buffer | Uint8Array,
  pathPrefix: string,
  filename: string,
  contentType?: string
): Promise<string> {
  const client = getClient();
  if (!S3_PRIVATE_BUCKET) {
    throw new Error("S3 private bucket not configured");
  }
  const safeName = sanitize(filename);
  const unique = uniqueId();
  const key = `${pathPrefix}/${unique}/${safeName}`;
  await client.send(
    new PutObjectCommand({
      Bucket: S3_PRIVATE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType ?? undefined,
    })
  );
  return key;
}

const PRESIGN_EXPIRES_IN = 300;

/**
 * Get a presigned GET URL for a private object (by key).
 */
export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const client = getClient();
  if (!S3_PRIVATE_BUCKET) {
    throw new Error("S3 private bucket not configured");
  }
  const command = new GetObjectCommand({
    Bucket: S3_PRIVATE_BUCKET,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRES_IN });
}

/**
 * Delete an object. Accepts either a full public URL (for public bucket) or a key (product-files/... for private).
 */
export async function deleteObject(urlOrKey: string): Promise<void> {
  const client = getClient();
  let bucket: string;
  let key: string;

  if (urlOrKey.startsWith("http")) {
    if (!S3_PUBLIC_URL || !urlOrKey.startsWith(S3_PUBLIC_URL + "/")) {
      return;
    }
    key = urlOrKey.slice((S3_PUBLIC_URL + "/").length);
    bucket = S3_PUBLIC_BUCKET!;
  } else if (urlOrKey.startsWith("product-files/")) {
    key = urlOrKey;
    bucket = S3_PRIVATE_BUCKET!;
  } else {
    return;
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
