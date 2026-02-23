import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const faviconUrl =
      settings.faviconUrl && typeof settings.faviconUrl === "string" && settings.faviconUrl.trim() !== ""
        ? settings.faviconUrl.trim()
        : null;
    return {
      title: settings.siteName,
      description: "Discover and support developer creations",
      ...(faviconUrl && { icons: { icon: faviconUrl } }),
    };
  } catch {
    return {
      title: "Mod Marketplace",
      description: "Discover and support developer creations",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <ThemeProvider themeColors={settings.themeColors}>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
