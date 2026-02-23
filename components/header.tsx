import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteLogo } from "@/components/site-logo";

export async function Header() {
  const [session, settings] = await Promise.all([getServerSession(authOptions), getSiteSettings()]);
  const siteName = settings.siteName || "Mod Marketplace";
  const siteLogo = settings.siteLogo && settings.siteLogo.startsWith("/") ? settings.siteLogo : null;
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold text-[var(--color-foreground)]">
          {siteLogo ? (
            <SiteLogo src={siteLogo} alt={siteName} className="h-8 w-8 rounded object-contain" />
          ) : null}
          {siteName}
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Products
          </Link>
          <Link
            href="/developers"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Developers
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
              >
                Client Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
