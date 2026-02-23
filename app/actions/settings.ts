"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ThemeColors, HomepageContent, FeatureFlags, DashboardSettings } from "@/lib/settings";
import { defaultSiteSettings } from "@/lib/settings";
import { logActivity, logSystem } from "@/lib/admin-log";
import type { Prisma } from "@/app/generated/prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updateSiteSetting(key: string, value: unknown) {
  const session = await requireAdmin();
  try {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue },
      update: { value: value as Prisma.InputJsonValue },
    });
    await logActivity({
      action: "settings.update",
      message: `Setting "${key}" updated`,
      meta: { key },
      userId: (session.user as { id?: string }).id,
    });
  } catch (err) {
    await logSystem({
      action: "system.error",
      message: err instanceof Error ? err.message : "Settings update failed",
      meta: { key, error: String(err) },
    });
    throw err;
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateThemeColors(themeColors: ThemeColors) {
  await updateSiteSetting("themeColors", themeColors);
}

export async function updateHomepageContent(content: HomepageContent) {
  await updateSiteSetting("homepageContent", content);
}

export async function updateDevelopersPageHeroImage(url: string | null) {
  await updateSiteSetting("developersPageHeroImage", url);
  revalidatePath("/developers");
}

export async function updateFeatureFlags(flags: FeatureFlags) {
  await updateSiteSetting("featureFlags", flags);
}

export async function updateSiteLogo(url: string | null) {
  await updateSiteSetting("siteLogo", url);
}

export async function updateFavicon(url: string | null) {
  await updateSiteSetting("faviconUrl", url);
}

export async function updateSiteName(siteName: string) {
  await updateSiteSetting("siteName", siteName);
}

export async function updateBannerImages(urls: string[]) {
  await updateSiteSetting("bannerImages", urls);
}

export async function updateDiscordInviteUrl(url: string) {
  await updateSiteSetting("discordInviteUrl", url);
}

export async function updateDashboardSettings(dashboardSettings: DashboardSettings) {
  await updateSiteSetting("dashboardSettings", dashboardSettings);
  revalidatePath("/dashboard");
}

export async function resetSiteToDefault() {
  const session = await requireAdmin();
  const d = defaultSiteSettings;
  await prisma.siteSetting.upsert({
    where: { key: "siteName" },
    create: { key: "siteName", value: d.siteName as Prisma.InputJsonValue },
    update: { value: d.siteName as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "siteLogo" },
    create: { key: "siteLogo", value: d.siteLogo as Prisma.InputJsonValue },
    update: { value: d.siteLogo as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "faviconUrl" },
    create: { key: "faviconUrl", value: d.faviconUrl as Prisma.InputJsonValue },
    update: { value: d.faviconUrl as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "bannerImages" },
    create: { key: "bannerImages", value: d.bannerImages as Prisma.InputJsonValue },
    update: { value: d.bannerImages as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "themeColors" },
    create: { key: "themeColors", value: d.themeColors as Prisma.InputJsonValue },
    update: { value: d.themeColors as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "homepageContent" },
    create: { key: "homepageContent", value: d.homepageContent as Prisma.InputJsonValue },
    update: { value: d.homepageContent as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "developersPageHeroImage" },
    create: { key: "developersPageHeroImage", value: d.developersPageHeroImage as Prisma.InputJsonValue },
    update: { value: d.developersPageHeroImage as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "featureFlags" },
    create: { key: "featureFlags", value: d.featureFlags as Prisma.InputJsonValue },
    update: { value: d.featureFlags as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "discordInviteUrl" },
    create: { key: "discordInviteUrl", value: d.discordInviteUrl as Prisma.InputJsonValue },
    update: { value: d.discordInviteUrl as Prisma.InputJsonValue },
  });
  await prisma.siteSetting.upsert({
    where: { key: "dashboardSettings" },
    create: { key: "dashboardSettings", value: d.dashboardSettings as Prisma.InputJsonValue },
    update: { value: d.dashboardSettings as Prisma.InputJsonValue },
  });
  await logActivity({
    action: "settings.reset_to_default",
    message: "Site settings reset to defaults",
    meta: {},
    userId: (session.user as { id?: string }).id,
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  revalidatePath("/developers");
}
