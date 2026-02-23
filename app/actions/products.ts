"use server";

import { getServerSession } from "next-auth";
import { Prisma } from "@/app/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteBlob } from "@/lib/blob";
import { addRolesToGuildMember, removeRolesFromGuildMember } from "@/lib/discord-roles";
import { logActivity } from "@/lib/admin-log";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createProduct(formData: FormData) {
  const session = await requireAdmin();
  const developerId = formData.get("developerId") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = (formData.get("shortDescription") as string) || null;
  const longDescription = (formData.get("longDescription") as string) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const version = (formData.get("version") as string) || null;
  const published = formData.get("published") === "on";
  const created = await prisma.product.create({
    data: {
      developerId,
      name,
      slug,
      shortDescription,
      longDescription,
      price: price != null ? price : undefined,
      version,
      published,
    },
  });
  await logActivity({
    action: "product.create",
    message: `Product "${name}" created`,
    meta: { productId: created.id, developerId },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/developers");
  return { id: created.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await requireAdmin();
  const developerId = formData.get("developerId") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = (formData.get("shortDescription") as string) || null;
  const longDescription = (formData.get("longDescription") as string) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const version = (formData.get("version") as string) || null;
  const published = formData.get("published") === "on";
  await prisma.product.update({
    where: { id },
    data: {
      developerId,
      name,
      slug,
      shortDescription,
      longDescription,
      price: price != null ? price : undefined,
      version,
      published,
    },
  });
  await logActivity({
    action: "product.update",
    message: `Product "${name}" updated`,
    meta: { productId: id, developerId },
    userId: (session.user as { id?: string }).id,
  });
  const product = await prisma.product.findUnique({ where: { id }, select: { developer: { select: { slug: true } } } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/developers");
  if (product) revalidatePath(`/developers/${product.developer.slug}`);
}

export async function deleteProduct(id: string) {
  const session = await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  await prisma.product.delete({ where: { id } });
  await logActivity({
    action: "product.delete",
    message: product ? `Product "${product.name}" deleted` : "Product deleted",
    meta: { productId: id },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/developers");
}

export async function addProductImage(productId: string, url: string, alt: string | null, order: number) {
  await requireAdmin();
  await prisma.productImage.create({
    data: { productId, url, alt, order },
  });
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { developer: { select: { slug: true } } } });
  revalidatePath("/admin/products");
  if (product) revalidatePath(`/developers/${product.developer.slug}/products`);
}

export async function removeProductImage(imageId: string) {
  await requireAdmin();
  const img = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { productId: true, url: true },
  });
  await prisma.productImage.delete({ where: { id: imageId } });
  if (img?.url) await deleteBlob(img.url);
  const product = img ? await prisma.product.findUnique({ where: { id: img.productId }, select: { developer: { select: { slug: true } } } }) : null;
  revalidatePath("/admin/products");
  if (product) revalidatePath(`/developers/${product.developer.slug}/products`);
}

export async function addProductVersion(
  productId: string,
  data: { version: string; changelog?: string | null; fileId?: string | null }
) {
  await requireAdmin();
  await prisma.productVersion.create({
    data: { productId, version: data.version, changelog: data.changelog ?? null, fileId: data.fileId ?? null },
  });
  revalidatePath("/admin/products");
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { developer: { select: { slug: true } } } });
  if (product) revalidatePath(`/developers/${product.developer.slug}/products`);
}

export async function grantProductAccess(productId: string, userEmail: string): Promise<{ ok: true } | { error: string }> {
  const session = await requireAdmin();
  const user = await prisma.user.findFirst({ where: { email: userEmail } });
  if (!user) return { error: "User not found with that email" };
  await prisma.purchase.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId, grantedBy: "admin" },
    update: {},
  });
  const guildId = process.env.DISCORD_GUILD_ID;
  if (guildId && user.discordId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { accessRoleIds: true },
    });
    const productRoleIds = product ? getProductAccessRoleIds(product) : [];
    if (productRoleIds.length > 0) {
      addRolesToGuildMember(guildId, user.discordId, productRoleIds).catch((err) => {
        console.warn("[grantProductAccess] Discord role assignment failed:", err);
      });
    }
  }
  await logActivity({
    action: "product.grant_access",
    message: `Access granted to ${userEmail} for product`,
    meta: { productId, userId: user.id },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function revokeProductAccess(productId: string, userId: string): Promise<{ ok: true } | { error: string }> {
  const session = await requireAdmin();
  const guildId = process.env.DISCORD_GUILD_ID;
  if (guildId) {
    const [product, user] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId }, select: { accessRoleIds: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { discordId: true } }),
    ]);
    const productRoleIds = product ? getProductAccessRoleIds(product) : [];
    if (productRoleIds.length > 0 && user?.discordId) {
      removeRolesFromGuildMember(guildId, user.discordId, productRoleIds).catch((err) => {
        console.warn("[revokeProductAccess] Discord role removal failed:", err);
      });
    }
  }
  await prisma.purchase.delete({
    where: { userId_productId: { userId, productId } },
  });
  await logActivity({
    action: "product.revoke_access",
    message: "Product access revoked for user",
    meta: { productId, userId },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
  return { ok: true };
}

function getProductAccessRoleIds(product: { accessRoleIds: unknown }): string[] {
  const raw = product.accessRoleIds;
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return [];
}

export async function addProductAccessRoleId(productId: string, roleId: string): Promise<{ ok: true } | { error: string }> {
  const session = await requireAdmin();
  const trimmed = roleId.trim();
  if (!trimmed) return { error: "Role ID is required" };
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { accessRoleIds: true } });
  if (!product) return { error: "Product not found" };
  const current = getProductAccessRoleIds(product);
  if (current.includes(trimmed)) return { ok: true };
  await prisma.product.update({
    where: { id: productId },
    data: { accessRoleIds: [...current, trimmed] },
  });
  await logActivity({
    action: "product.add_access_role",
    message: `Role ID ${trimmed} added to product`,
    meta: { productId, roleId: trimmed },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeProductAccessRoleId(productId: string, roleId: string): Promise<{ ok: true } | { error: string }> {
  const session = await requireAdmin();
  const trimmed = roleId.trim();
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { accessRoleIds: true } });
  if (!product) return { error: "Product not found" };
  const current = getProductAccessRoleIds(product);
  const next = current.filter((id) => id !== trimmed);
  await prisma.product.update({
    where: { id: productId },
    data: { accessRoleIds: next.length ? next : Prisma.JsonNull },
  });
  await logActivity({
    action: "product.remove_access_role",
    message: `Role ID ${trimmed} removed from product`,
    meta: { productId, roleId: trimmed },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addProductFile(
  productId: string,
  data: { blobUrl: string; filename: string; size?: number; mimeType?: string }
): Promise<string> {
  await requireAdmin();
  const file = await prisma.productFile.create({
    data: { productId, blobUrl: data.blobUrl, filename: data.filename, size: data.size ?? null, mimeType: data.mimeType ?? null },
  });
  revalidatePath("/admin/products");
  return file.id;
}

export async function removeProductFile(productFileId: string) {
  await requireAdmin();
  const file = await prisma.productFile.findUnique({
    where: { id: productFileId },
    include: { versionRef: true },
  });
  if (!file) throw new Error("File not found");
  if (file.versionRef) throw new Error("Cannot remove a file that is attached to a version. Remove the version instead.");
  await prisma.productFile.delete({ where: { id: productFileId } });
  await deleteBlob(file.blobUrl);
  const product = await prisma.product.findUnique({ where: { id: file.productId }, select: { developer: { select: { slug: true } } } });
  revalidatePath("/admin/products");
  if (product) revalidatePath(`/developers/${product.developer.slug}/products`);
}
