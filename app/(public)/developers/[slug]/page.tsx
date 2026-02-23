import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductListToolbar } from "@/components/product-list-toolbar";

type SocialLinks = { discord?: string; twitter?: string; website?: string };

const SORT_VALUES = ["newest", "name", "price-asc", "price-desc"] as const;
const FILTER_VALUES = ["all", "under-20", "20-50", "50-plus"] as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const developer = await prisma.developer.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!developer) return { title: "Developer | Mod Marketplace" };
  return {
    title: `${developer.name} | Mod Marketplace`,
    description: developer.description?.slice(0, 160) ?? `Browse ${developer.name}'s products.`,
  };
}

export default async function DeveloperProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; filter?: string }>;
}) {
  const { slug } = await params;
  const { sort: sortParam, filter: filterParam } = await searchParams;
  const sort = SORT_VALUES.includes(sortParam as (typeof SORT_VALUES)[number])
    ? (sortParam as (typeof SORT_VALUES)[number])
    : "newest";
  const filter = FILTER_VALUES.includes(filterParam as (typeof FILTER_VALUES)[number])
    ? (filterParam as (typeof FILTER_VALUES)[number])
    : "all";

  const developer = await prisma.developer.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        include: { images: { take: 1, orderBy: { order: "asc" } } },
      },
    },
  });
  if (!developer) notFound();

  let products = [...developer.products];
  if (filter === "under-20") products = products.filter((p) => p.price != null && Number(p.price) < 20);
  else if (filter === "20-50")
    products = products.filter((p) => p.price != null && Number(p.price) >= 20 && Number(p.price) <= 50);
  else if (filter === "50-plus") products = products.filter((p) => p.price != null && Number(p.price) > 50);

  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "price-asc") products.sort((a, b) => (Number(a.price ?? 0) > Number(b.price ?? 0) ? 1 : -1));
  else if (sort === "price-desc") products.sort((a, b) => (Number(a.price ?? 0) < Number(b.price ?? 0) ? 1 : -1));
  else products.sort((a, b) => (new Date(b.updatedAt) > new Date(a.updatedAt) ? 1 : -1));

  const social = (developer.socialLinks ?? {}) as SocialLinks;

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {developer.bannerUrl && (
          <div className="aspect-[3/1] bg-[var(--color-border)]">
            <img src={developer.bannerUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="relative px-6 pb-6 pt-4">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
            {developer.logoUrl ? (
              <img
                src={developer.logoUrl}
                alt=""
                className="h-28 w-28 rounded-2xl border-4 border-[var(--color-surface)] object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-[var(--color-surface)] bg-[var(--color-primary)]/20 text-4xl font-bold text-[var(--color-primary)] shadow-lg">
                {developer.name.slice(0, 1)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{developer.name}</h1>
              <div className="mt-2 flex flex-wrap gap-3">
                {social.discord && (
                  <a
                    href={social.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Discord
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Twitter
                  </a>
                )}
                {social.website && (
                  <a
                    href={social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
          {developer.description && (
            <p className="mt-6 whitespace-pre-wrap text-[var(--color-muted)]">{developer.description}</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Products</h2>
        <div className="mt-4">
          <ProductListToolbar totalCount={products.length} sort={sort} filter={filter} />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const features = (p.featureList ?? []) as string[];
            const badge = features[0];
            return (
              <Link
                key={p.id}
                href={`/developers/${developer.slug}/products/${p.slug}`}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition hover:border-[var(--color-primary)]"
              >
                <div className="relative aspect-video bg-[var(--color-border)]">
                  {p.images[0]?.url ? (
                    <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--color-muted)]">No image</div>
                  )}
                  {badge && (
                    <span className="absolute right-2 top-2 rounded bg-[var(--color-surface)]/90 px-2 py-0.5 text-xs text-[var(--color-foreground)]">
                      {badge}
                    </span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
                    {p.name}
                  </h3>
                  {p.price != null && (
                    <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">
                      ${Number(p.price).toFixed(2)} USD
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        {products.length === 0 && (
          <p className="mt-6 text-[var(--color-muted)]">No products yet.</p>
        )}
      </div>
    </div>
  );
}
