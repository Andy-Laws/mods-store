"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/admin-log";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createDeveloper(formData: FormData) {
  const session = await requireAdmin();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const bannerUrl = (formData.get("bannerUrl") as string) || null;
  const discord = (formData.get("socialDiscord") as string) || undefined;
  const twitter = (formData.get("socialTwitter") as string) || undefined;
  const website = (formData.get("socialWebsite") as string) || undefined;
  const socialLinks = discord || twitter || website ? { discord, twitter, website } : undefined;
  const created = await prisma.developer.create({
    data: { name, slug, description, logoUrl, bannerUrl, socialLinks: socialLinks ?? undefined },
  });
  await logActivity({
    action: "developer.create",
    message: `Developer "${name}" created`,
    meta: { developerId: created.id, slug },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/developers");
  revalidatePath("/developers");
  revalidatePath("/");
}

export async function updateDeveloper(id: string, formData: FormData) {
  const session = await requireAdmin();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const bannerUrl = (formData.get("bannerUrl") as string) || null;
  const discord = (formData.get("socialDiscord") as string) || undefined;
  const twitter = (formData.get("socialTwitter") as string) || undefined;
  const website = (formData.get("socialWebsite") as string) || undefined;
  const socialLinks = discord || twitter || website ? { discord, twitter, website } : undefined;
  await prisma.developer.update({
    where: { id },
    data: { name, slug, description, logoUrl, bannerUrl, socialLinks: socialLinks ?? undefined },
  });
  await logActivity({
    action: "developer.update",
    message: `Developer "${name}" updated`,
    meta: { developerId: id, slug },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/developers");
  revalidatePath(`/admin/developers/${id}`);
  revalidatePath("/developers");
  revalidatePath(`/developers/${slug}`);
  revalidatePath("/");
}

export async function deleteDeveloper(id: string) {
  const session = await requireAdmin();
  const dev = await prisma.developer.findUnique({ where: { id }, select: { name: true } });
  await prisma.developer.delete({ where: { id } });
  await logActivity({
    action: "developer.delete",
    message: dev ? `Developer "${dev.name}" deleted` : "Developer deleted",
    meta: { developerId: id },
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/admin/developers");
  revalidatePath("/developers");
  revalidatePath("/");
}
