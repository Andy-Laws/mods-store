import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncUserRolesFromDiscord } from "@/lib/sync-discord-roles";
import { getLocalFilePath } from "@/lib/blob";
import { isS3Configured, getPresignedDownloadUrl } from "@/lib/s3";

type ProductWithFiles = {
  id: string;
  accessRoleIds: unknown;
  versions: { id: string; file: { id: string; blobUrl: string; filename: string; mimeType: string | null } | null }[];
  files: { id: string; blobUrl: string; filename: string; mimeType: string | null; versionRef: { id: string } | null }[];
};

function normalizeRoleIds(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  if (raw != null && typeof raw === "string") return [String(raw).trim()].filter(Boolean);
  return [];
}

function getProductRoleIds(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return [];
}

function hasAccessByRole(userAccessRoleIds: string[], productAccessRoleIds: unknown): boolean {
  if (!userAccessRoleIds.length) return false;
  const productIds = getProductRoleIds(productAccessRoleIds);
  if (!productIds.length) return false;
  return productIds.some((pid) => userAccessRoleIds.some((uid) => uid === pid));
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const fileId = searchParams.get("fileId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { userId_productId: { userId, productId } },
    include: {
      product: {
        include: {
          versions: {
            where: { fileId: { not: null } },
            orderBy: { releaseDate: "desc" },
            take: 1,
            include: { file: true },
          },
          files: { include: { versionRef: true } },
        },
      },
    },
  });

  let product: ProductWithFiles | null = null;

  if (purchase) {
    product = purchase.product as unknown as ProductWithFiles;
  } else {
    await syncUserRolesFromDiscord(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const productRow = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        versions: {
          where: { fileId: { not: null } },
          orderBy: { releaseDate: "desc" },
          take: 1,
          include: { file: true },
        },
        files: { include: { versionRef: true } },
      },
    });
    if (!productRow) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const userRoleIds = normalizeRoleIds(user?.accessRoleIds ?? null);
    if (!hasAccessByRole(userRoleIds, productRow.accessRoleIds)) {
      return NextResponse.json({ error: "You do not have access to this product" }, { status: 403 });
    }
    product = productRow as unknown as ProductWithFiles;
  }

  const directFiles = product.files.filter((f) => !f.versionRef);

  let fileToServe: { blobUrl: string; filename: string; mimeType: string | null } | null = null;

  if (fileId) {
    const file = product.files.find((f) => f.id === fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found or not part of this product" }, { status: 404 });
    }
    fileToServe = {
      blobUrl: file.blobUrl,
      filename: file.filename,
      mimeType: file.mimeType,
    };
  } else {
    const versionWithFile = product.versions[0];
    if (versionWithFile?.file) {
      fileToServe = {
        blobUrl: versionWithFile.file.blobUrl,
        filename: versionWithFile.file.filename,
        mimeType: versionWithFile.file.mimeType,
      };
    } else if (directFiles.length > 0) {
      fileToServe = {
        blobUrl: directFiles[0].blobUrl,
        filename: directFiles[0].filename,
        mimeType: directFiles[0].mimeType,
      };
    }
  }

  if (!fileToServe) {
    return NextResponse.json({ error: "No download available for this product" }, { status: 404 });
  }

  const localPath = getLocalFilePath(fileToServe.blobUrl);

  if (localPath && existsSync(localPath)) {
    const buffer = await readFile(localPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": fileToServe.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileToServe.filename}"`,
      },
    });
  }

  if (fileToServe.blobUrl.startsWith("http")) {
    return NextResponse.redirect(fileToServe.blobUrl);
  }

  if (isS3Configured() && fileToServe.blobUrl.startsWith("product-files/")) {
    const downloadUrl = await getPresignedDownloadUrl(fileToServe.blobUrl);
    return NextResponse.redirect(downloadUrl, 302);
  }

  return NextResponse.json({ error: "File not found" }, { status: 404 });
}
