import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultSettings = [
    { key: "siteLogo", value: null as string | null },
    { key: "bannerImages", value: [] as string[] },
    { key: "themeColors", value: { primary: "#6366f1", secondary: "#8b5cf6", background: "#0f0f12", surface: "#18181b" } },
    { key: "homepageContent", value: { heroTitle: "Mod Marketplace", heroSubtitle: "Discover and support developer creations." } },
    { key: "featureFlags", value: { storeEnabled: true, registrationOpen: true } },
    { key: "discordInviteUrl", value: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "" },
  ];

  for (const { key, value } of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as object },
      update: { value: value as object },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
