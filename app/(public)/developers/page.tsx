import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Developers | Mod Marketplace",
  description: "Browse developers and their products on the mod marketplace.",
};

export default async function DevelopersPage() {
  const [settings, developers] = await Promise.all([
    getSiteSettings(),
    prisma.developer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);
  const siteName = settings.siteName || "Mod Marketplace";
  const developersPageHeroImage = settings.developersPageHeroImage;

  return (
    <div className="w-full">
      {/* Page hero — uses its own image (separate from homepage) */}
      <section
        className="relative flex min-h-[40vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8"
        style={
          developersPageHeroImage
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(15,15,18,0.95) 100%), url(${developersPageHeroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        {!developersPageHeroImage && (
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.1) 0%, transparent 50%), linear-gradient(180deg, var(--color-background) 0%, #0a0a0d 100%)",
            }}
          />
        )}
        <div className="relative z-10 max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[var(--color-primary)]">
            {siteName}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
            Developers
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/80">
            Browse creators and their products. Find mods and support your favorite developers.
          </p>
        </div>
      </section>

      {/* Developers only — no feature strip */}
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
            All creators
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev) => (
              <Link
                key={dev.id}
                href={`/developers/${dev.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-primary)]/5"
              >
                {dev.bannerUrl ? (
                  <div className="aspect-[21/9] bg-[var(--color-border)]">
                    <img
                      src={dev.bannerUrl}
                      alt=""
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="aspect-[21/9] bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-primary)]/5" />
                )}
                <div className="flex items-center gap-5 p-6">
                  {dev.logoUrl ? (
                    <img
                      src={dev.logoUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-[var(--color-border)] transition group-hover:ring-[var(--color-primary)]/50"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/20 text-2xl font-bold text-[var(--color-primary)]">
                      {dev.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                      {dev.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {dev._count.products} {dev._count.products === 1 ? "product" : "products"}
                    </p>
                    {dev.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
                        {dev.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {developers.length === 0 && (
          <section className="mt-16 rounded-2xl border border-dashed border-[var(--color-border)] p-16 text-center text-[var(--color-muted)]">
            No developers yet. Sign in as admin to add creators and products.
          </section>
        )}

        {/* Bottom CTA */}
        <section className="relative mt-24 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-strip)] py-16 lg:py-20">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(99,102,241,0.08) 100%)`,
            }}
          />
          <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
              Ready to explore?
            </h2>
            <p className="mt-4 text-[var(--color-muted)]">
              Sign in with Discord to manage your purchases.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signin"
                className="rounded-full bg-[var(--color-primary)] px-6 py-3 font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition hover:opacity-90"
              >
                Sign in with Discord
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
