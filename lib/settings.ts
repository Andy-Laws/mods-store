import { prisma } from "@/lib/db";

export type ThemeColors = {
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  foreground?: string;
  muted?: string;
  border?: string;
};

export type HomepageContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBackgroundImage?: string | null;
};

export type FeatureFlags = {
  storeEnabled?: boolean;
  registrationOpen?: boolean;
};

export type DashboardSettings = {
  dashboardTitle?: string | null;
  dashboardHeroImageUrl?: string | null;
  showStatAvailableDownloads?: boolean;
  showStatTotalProducts?: boolean;
  showStatMemberSince?: boolean;
  showStatAssignedRoles?: boolean;
};

export type SiteSettings = {
  siteName: string;
  siteLogo: string | null;
  faviconUrl: string | null;
  bannerImages: string[];
  themeColors: ThemeColors;
  homepageContent: HomepageContent;
  developersPageHeroImage: string | null;
  featureFlags: FeatureFlags;
  discordInviteUrl: string;
  dashboardSettings: DashboardSettings;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "Mod Marketplace",
  siteLogo: null,
  faviconUrl: null,
  bannerImages: [],
  themeColors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#0f0f12",
    surface: "#18181b",
    foreground: "#fafafa",
    muted: "#71717a",
    border: "#27272a",
  },
  homepageContent: {
    heroTitle: "Mod Marketplace",
    heroSubtitle: "Discover and support developer creations.",
    heroBackgroundImage: null,
  },
  developersPageHeroImage: null,
  featureFlags: { storeEnabled: true, registrationOpen: true },
  discordInviteUrl: "",
  dashboardSettings: {
    dashboardTitle: null,
    dashboardHeroImageUrl: null,
    showStatAvailableDownloads: true,
    showStatTotalProducts: true,
    showStatMemberSince: true,
    showStatAssignedRoles: true,
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value as unknown]));
    const rawFavicon = map.get("faviconUrl");
    const rawLogo = map.get("siteLogo");
    const faviconUrl =
      typeof rawFavicon === "string" && (rawFavicon.startsWith("/") || rawFavicon.startsWith("http"))
        ? rawFavicon
        : defaultSiteSettings.faviconUrl;
    const siteLogo =
      typeof rawLogo === "string" && (rawLogo.startsWith("/") || rawLogo.startsWith("http"))
        ? rawLogo
        : defaultSiteSettings.siteLogo;

    return {
      siteName: (map.get("siteName") as string | undefined) ?? defaultSiteSettings.siteName,
      siteLogo,
      faviconUrl,
      bannerImages: (map.get("bannerImages") as string[]) ?? defaultSiteSettings.bannerImages,
      themeColors: { ...defaultSiteSettings.themeColors, ...(map.get("themeColors") as ThemeColors | undefined) },
      homepageContent: { ...defaultSiteSettings.homepageContent, ...(map.get("homepageContent") as HomepageContent | undefined) },
      developersPageHeroImage: (map.get("developersPageHeroImage") as string | null | undefined) ?? defaultSiteSettings.developersPageHeroImage,
      featureFlags: { ...defaultSiteSettings.featureFlags, ...(map.get("featureFlags") as FeatureFlags | undefined) },
      discordInviteUrl: (map.get("discordInviteUrl") as string) ?? defaultSiteSettings.discordInviteUrl,
      dashboardSettings: {
        ...defaultSiteSettings.dashboardSettings,
        ...(map.get("dashboardSettings") as Partial<DashboardSettings> | undefined),
      },
    };
  } catch {
    return defaultSiteSettings;
  }
}
