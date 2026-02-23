import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export default async function HomePage() {
  const [session, settings, developers] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
    prisma.developer.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
  ]);
  const { heroTitle, heroSubtitle: rawSubtitle, heroBackgroundImage } = settings.homepageContent;
  const heroSubtitle =
    rawSubtitle?.trim() && !/^(\w)\1+$/i.test(rawSubtitle.trim())
      ? rawSubtitle.trim()
      : "Discover and support developer creations.";

  return (
    <div className="w-full">
      {/* Hero — full viewport with optional background image */}
      <section
        className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8"
        style={
          heroBackgroundImage
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(15,15,18,0.95) 100%), url(${heroBackgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        {!heroBackgroundImage && (
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 50%), linear-gradient(180deg, var(--color-background) 0%, #0a0a0d 100%)",
            }}
          />
        )}
        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-primary)]">
            {settings.siteName || "Mod Marketplace"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            {heroSubtitle}
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/developers"
              className="rounded-full bg-[var(--color-primary)] px-8 py-4 font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition hover:opacity-90 hover:shadow-[var(--color-primary)]/40"
            >
              Explore the marketplace
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-full border-2 border-white/60 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-full border-2 border-white/60 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10"
              >
                Sign in with Discord
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature strip — angled band */}
      <section className="relative -mb-8 overflow-hidden bg-[var(--color-strip)] py-20 lg:py-24">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(99,102,241,0.08) 100%)`,
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:gap-12 sm:px-6 lg:px-8">
          <div className="group text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/20 text-2xl transition group-hover:scale-110 group-hover:bg-[var(--color-primary)]/30">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Get it right away</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Your purchase is available instantly on the confirmation screen and sent to your email—no waiting.
            </p>
          </div>
          <div className="group text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/20 text-2xl transition group-hover:scale-110 group-hover:bg-[var(--color-primary)]/30">
              ?
            </div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Need help?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Run into an issue? Check the support docs or reach out in our Discord and we’ll get you sorted.
            </p>
          </div>
          <div className="group text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/20 text-2xl transition group-hover:scale-110 group-hover:bg-[var(--color-primary)]/30">
              📦
            </div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Ready to drop in</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Mods are delivered in a simple format so you can install quickly—often as easy as drag and drop.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {developers.length > 0 && (
          <section className="pt-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
                Creators
              </h2>
              <Link
                href="/developers"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((dev) => (
                <Link
                  key={dev.id}
                  href={`/developers/${dev.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-primary)]/5"
                >
                  <div className="flex items-center gap-5 p-6">
                    {dev.logoUrl ? (
                      <img
                        src={dev.logoUrl}
                        alt=""
                        className="h-16 w-16 rounded-xl object-cover ring-2 ring-[var(--color-border)] transition group-hover:ring-[var(--color-primary)]/50"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--color-primary)]/20 text-2xl font-bold text-[var(--color-primary)]">
                        {dev.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                        {dev.name}
                      </h3>
                      {dev.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">
                          {dev.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {developers.length === 0 && (
          <section className="mt-16 rounded-2xl border border-dashed border-[var(--color-border)] p-16 text-center text-[var(--color-muted)]">
            No developers or products yet. Sign in as admin to add content.
          </section>
        )}

        {/* Bottom CTA — matches feature strip */}
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
              {session
                ? "Browse creators, find mods you love, and get instant access—or go to your dashboard to manage your purchases."
                : "Browse creators, find mods you love, and get instant access—or sign in to manage your purchases."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/developers"
                className="rounded-full bg-[var(--color-primary)] px-6 py-3 font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition hover:opacity-90"
              >
                Browse creators
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-3 font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-3 font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]"
                >
                  Sign in with Discord
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
