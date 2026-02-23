import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Products | Mod Marketplace",
  description: "Browse all products from every developer on the mod marketplace.",
};

export default async function ProductsPage() {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || "Mod Marketplace";
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    include: {
      developer: { select: { name: true, slug: true } },
      images: { take: 1, orderBy: { order: "asc" } },
    },
  });

  return (
    <div className="w-full">
      {/* Simple header — no background, just a clean intro area */}
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-[var(--color-primary)]">
          {siteName}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] md:text-4xl">
          Products
        </h1>
        <p className="mt-3 max-w-xl text-[var(--color-muted)]">
          All products from every developer. Browse mods, pick what you need, and get instant access.
        </p>
      </div>

      {/* Products area — contained, same style as home/developers */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 lg:p-10">
          <h2 className="sr-only">All products</h2>
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/developers/${p.developer.slug}/products/${p.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] transition hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
                >
                  <div className="aspect-[4/3] bg-[var(--color-border)]">
                    {p.images[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{p.developer.name}</p>
                    {p.price != null && (
                      <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">
                        ${Number(p.price).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center text-[var(--color-muted)]">
              No products yet. Check back later or browse developers.
              <div className="mt-6">
                <Link
                  href="/developers"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Browse developers →
                </Link>
              </div>
            </div>
          )}
        </section>

        {products.length > 0 && (
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            <Link href="/developers" className="text-[var(--color-primary)] hover:underline">
              Browse by developer
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
