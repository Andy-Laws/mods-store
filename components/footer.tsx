import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export async function Footer() {
  const [session, settings] = await Promise.all([getServerSession(authOptions), getSiteSettings()]);
  const siteName = settings.siteName || "Mod Marketplace";
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  return (
    <footer className="relative border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 100%)`,
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-lg font-semibold text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
            >
              {siteName}
            </Link>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">
              Discover and support developer creations. Get mods instantly.
            </p>
          </div>
          <nav className="flex flex-wrap gap-8 sm:gap-10">
            <Link
              href="/developers"
              className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
            >
              Developers
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
            >
              Sign in
            </Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--color-muted)]">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-[var(--color-muted)]">
            <Link href="/" className="transition hover:text-[var(--color-foreground)]">
              Home
            </Link>
            <Link href="/products" className="transition hover:text-[var(--color-foreground)]">
              Products
            </Link>
            <Link href="/developers" className="transition hover:text-[var(--color-foreground)]">
              Developers
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[var(--color-primary)] transition hover:opacity-80"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
