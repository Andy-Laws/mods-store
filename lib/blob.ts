import { mkdirSync } from "fs";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import {
  isS3Configured,
  uploadPublic as s3UploadPublic,
  uploadPrivate as s3UploadPrivate,
  deleteObject as s3DeleteObject,
} from "@/lib/s3";

const PUBLIC_UPLOADS = path.join(process.cwd(), "public", "uploads");
const PRIVATE_STORAGE = path.join(process.cwd(), "storage");

const UPLOAD_DIRS = [
  path.join(PUBLIC_UPLOADS, "site"),
  path.join(PUBLIC_UPLOADS, "site", "favicon"),
  path.join(PUBLIC_UPLOADS, "site", "homepage"),
  path.join(PUBLIC_UPLOADS, "site", "developers-page"),
  path.join(PUBLIC_UPLOADS, "developers", "logos"),
  path.join(PUBLIC_UPLOADS, "developers", "banners"),
  path.join(PUBLIC_UPLOADS, "products", "images"),
  path.join(PRIVATE_STORAGE, "product-files"),
];

let uploadDirsInitialized = false;

function ensureUploadDirs(): void {
  if (uploadDirsInitialized) return;
  for (const dir of UPLOAD_DIRS) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore; uploadBlob will create the specific dir it needs and surface errors
    }
  }
  uploadDirsInitialized = true;
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Returns a URL for public assets (/uploads/... or full S3 URL) or a key for private files (product-files/...). */
export async function uploadBlob(
  file: File | Blob,
  pathPrefix: string
): Promise<{ url: string }> {
  const name = (file as File).name ?? "file";
  const safeName = sanitize(name);
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const isPrivate = pathPrefix === "products/files";

  if (isS3Configured()) {
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());
    const contentType = (file as File).type || undefined;
    if (isPrivate) {
      const key = await s3UploadPrivate(buffer, "product-files", safeName, contentType);
      return { url: key };
    }
    const url = await s3UploadPublic(buffer, pathPrefix, `${unique}-${safeName}`, contentType);
    return { url };
  }

  ensureUploadDirs();
  if (isPrivate) {
    const dir = path.join(PRIVATE_STORAGE, "product-files", unique);
    try {
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, safeName);
      const buffer = Buffer.from(await (file as Blob).arrayBuffer());
      await writeFile(filePath, buffer);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "EACCES" || err.code === "EPERM" || err.code === "ENOENT") {
        throw new Error(
          `Cannot write product file (check storage dir). On the server run: npm run setup:uploads. Original: ${err.message}`
        );
      }
      throw e;
    }
    const storedPath = `product-files/${unique}/${safeName}`;
    return { url: storedPath };
  }

  const dir = path.join(PUBLIC_UPLOADS, pathPrefix);
  try {
    await mkdir(dir, { recursive: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "EACCES" || err.code === "EPERM") {
      throw new Error(
        `Cannot create upload directory (permission denied). On the server run: npm run setup:uploads (or APP_USER=<app-user> npm run setup:uploads). Original: ${err.message}`
      );
    }
    if (err.code === "ENOENT") {
      throw new Error(
        `Upload directory missing. On the server run: npm run setup:uploads. Original: ${err.message}`
      );
    }
    throw e;
  }
  const filename = `${unique}-${safeName}`;
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await (file as Blob).arrayBuffer());
  try {
    await writeFile(filePath, buffer);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "EACCES" || err.code === "EPERM") {
      throw new Error(
        `Cannot write upload (permission denied). On the server run: npm run setup:uploads (or APP_USER=<app-user> npm run setup:uploads). Original: ${err.message}`
      );
    }
    throw e;
  }
  const url = `/uploads/${pathPrefix}/${filename}`;
  return { url };
}

export async function uploadBlobFromBuffer(
  buffer: Buffer,
  filename: string,
  pathPrefix: string
): Promise<{ url: string }> {
  const safeName = sanitize(filename);
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const isPrivate = pathPrefix === "products/files";

  if (isS3Configured()) {
    if (isPrivate) {
      const key = await s3UploadPrivate(buffer, "product-files", safeName);
      return { url: key };
    }
    const url = await s3UploadPublic(buffer, pathPrefix, `${unique}-${safeName}`);
    return { url };
  }

  ensureUploadDirs();
  if (isPrivate) {
    const dir = path.join(PRIVATE_STORAGE, "product-files", unique);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);
    return { url: `product-files/${unique}/${safeName}` };
  }

  const dir = path.join(PUBLIC_UPLOADS, pathPrefix);
  await mkdir(dir, { recursive: true });
  const name = `${unique}-${safeName}`;
  await writeFile(path.join(dir, name), buffer);
  return { url: `/uploads/${pathPrefix}/${name}` };
}

export async function deleteBlob(url: string): Promise<void> {
  if (isS3Configured() && (url.startsWith("http") || url.startsWith("product-files/"))) {
    await s3DeleteObject(url).catch(() => {});
    return;
  }
  if (url.startsWith("http")) {
    return;
  }
  if (url.startsWith("/uploads/")) {
    const relative = url.slice("/uploads/".length);
    const filePath = path.join(PUBLIC_UPLOADS, relative);
    await unlink(filePath).catch(() => {});
    return;
  }
  if (url.startsWith("product-files/")) {
    const filePath = path.join(PRIVATE_STORAGE, url);
    await unlink(filePath).catch(() => {});
    return;
  }
}

/** Resolve a stored URL to an absolute file path for streaming. Returns null if not a local private file (e.g. when using S3). */
export function getLocalFilePath(storedUrl: string): string | null {
  if (!storedUrl || storedUrl.startsWith("http")) return null;
  if (storedUrl.startsWith("product-files/")) {
    if (isS3Configured()) return null;
    return path.join(PRIVATE_STORAGE, storedUrl);
  }
  return null;
}
