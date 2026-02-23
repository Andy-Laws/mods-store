import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const dashboard = settings.dashboardSettings ?? {};
  const heroImageUrl = dashboard.dashboardHeroImageUrl ?? null;
  const title = dashboard.dashboardTitle?.trim() || "Dashboard";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold text-[var(--color-foreground)]">
            {title}
          </Link>
          <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
            Back to marketplace
          </Link>
        </div>
      </header>
      {heroImageUrl && (
        <div
          className="relative h-32 w-full bg-[var(--color-surface)]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(15,15,18,0.9) 100%), url(${heroImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
