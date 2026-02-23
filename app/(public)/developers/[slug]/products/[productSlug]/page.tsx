import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { PurchaseButton } from "./purchase-button";
import { ProductGallery } from "./product-gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const developer = await prisma.developer.findUnique({
    where: { slug },
    include: { products: { where: { slug: productSlug, published: true }, take: 1 } },
  });
  const product = developer?.products[0];
  if (!product) return { title: "Product | Mod Marketplace" };
  return {
    title: `${product.name} by ${developer.name} | Mod Marketplace`,
    description: product.shortDescription?.slice(0, 160) ?? product.name,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const [developer, settings] = await Promise.all([
    prisma.developer.findUnique({
      where: { slug },
      include: {
        products: {
          where: { slug: productSlug, published: true },
          include: {
            images: { orderBy: { order: "asc" } },
            versions: { orderBy: { releaseDate: "desc" } },
          },
        },
      },
    }),
    getSiteSettings(),
  ]);

  const product = developer?.products[0];
  if (!developer || !product) notFound();

  const features = (product.featureList ?? []) as string[];

  const description = product.longDescription || product.shortDescription || "No description.";

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--color-muted)]">
        <Link href="/developers" className="hover:text-[var(--color-foreground)]">Developers</Link>
        <span className="mx-2">/</span>
        <Link href={`/developers/${developer.slug}`} className="hover:text-[var(--color-foreground)]">
          {developer.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-foreground)]">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProductGallery
            images={product.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
            productName={product.name}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted)]">
              {developer.name}
            </p>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{product.name}</h1>
            {product.price != null && (
              <p className="text-2xl font-semibold text-[var(--color-foreground)]">
                ${Number(product.price).toFixed(2)} USD
              </p>
            )}
            <p className="text-sm text-[var(--color-muted)]">
              Instant delivery after purchase—available on the confirmation screen and via email.
            </p>
            <div>
              <PurchaseButton
                discordInviteUrl={settings.discordInviteUrl}
                productName={product.name}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Description</h2>
              <div className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-muted)]">
                {description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        {features.length > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Features</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--color-muted)]">
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {product.versions.length > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Changelog</h2>
            <div className="mt-4 space-y-4">
              {product.versions.map((v) => (
                <div key={v.id} className="border-l-2 border-[var(--color-border)] pl-4">
                  <p className="font-medium text-[var(--color-foreground)]">
                    v{v.version}
                    {v.releaseDate && (
                      <span className="ml-2 text-sm font-normal text-[var(--color-muted)]">
                        {new Date(v.releaseDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                  {v.changelog && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-muted)]">{v.changelog}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
