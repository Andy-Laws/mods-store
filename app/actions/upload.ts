"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function uploadDeveloperLogo(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "developers/logos");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadDeveloperBanner(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "developers/banners");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadProductImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "products/images");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadProductFile(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "products/files");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadSiteLogo(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "site");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadFavicon(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "site/favicon");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadHomepageBackground(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "site/homepage");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadDevelopersPageBackground(formData: FormData): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file?.size) return { error: "No file" };
    const { url } = await uploadBlob(file, "site/developers-page");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
