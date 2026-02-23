import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDevelopersPage() {
  const developers = await prisma.developer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">Developers</h1>
        <Link
          href="/admin/developers/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Add developer
        </Link>
      </div>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
        Create and edit vendor pages. Each developer can have multiple products.
      </p>

      {developers.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-12 px-6 text-center">
          <p className="text-sm font-medium text-[var(--color-foreground)]">No developers yet</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Add your first developer to start managing products and vendor pages.
          </p>
          <Link
            href="/admin/developers/new"
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Add developer
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((d) => (
            <Link
              key={d.id}
              href={`/admin/developers/${d.id}/edit`}
              className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)]"
            >
              <div className="flex items-center gap-3">
                {d.logoUrl ? (
                  <img
                    src={d.logoUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-[var(--color-border)] object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-lg font-semibold text-[var(--color-muted)]">
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--color-foreground)]">{d.name}</p>
                  <p className="truncate font-mono text-xs text-[var(--color-muted)]">{d.slug}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                <span className="text-sm text-[var(--color-muted)]">
                  {d._count.products} {d._count.products === 1 ? "product" : "products"}
                </span>
                <span className="text-sm font-medium text-[var(--color-primary)]">Edit →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
