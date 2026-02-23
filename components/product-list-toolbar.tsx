"use client";

import { useRouter, usePathname } from "next/navigation";

type SortValue = "newest" | "name" | "price-asc" | "price-desc";
type FilterValue = "all" | "under-20" | "20-50" | "50-plus";

export function ProductListToolbar({
  totalCount,
  sort,
  filter,
}: {
  totalCount: number;
  sort: SortValue;
  filter: FilterValue;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function updateParams(newSort: SortValue, newFilter: FilterValue) {
    const params = new URLSearchParams();
    if (newSort !== "newest") params.set("sort", newSort);
    if (newFilter !== "all") params.set("filter", newFilter);
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-muted)]">Filter:</span>
        <select
          value={filter}
          onChange={(e) => updateParams(sort, e.target.value as FilterValue)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Filter by price"
        >
          <option value="all">All</option>
          <option value="under-20">Under $20</option>
          <option value="20-50">$20 – $50</option>
          <option value="50-plus">$50+</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-muted)]">Sort by:</span>
        <select
          value={sort}
          onChange={(e) => updateParams(e.target.value as SortValue, filter)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Sort products"
        >
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <span className="text-sm text-[var(--color-muted)]">
          {totalCount} product{totalCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
