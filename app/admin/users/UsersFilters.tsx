"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const ROLES = [
  { value: "", label: "All roles" },
  { value: "user", label: "User" },
  { value: "developer", label: "Developer" },
  { value: "admin", label: "Admin" },
] as const;

export function UsersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const q = searchParams.get("q") ?? "";
  const role = searchParams.get("role") ?? "";

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const updateParams = useCallback(
    (updates: { q?: string; role?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) {
        if (updates.q) params.set("q", updates.q);
        else params.delete("q");
      }
      if (updates.role !== undefined) {
        if (updates.role) params.set("role", updates.role);
        else params.delete("role");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ role: e.target.value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query.trim() || undefined });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-0 gap-2 sm:min-w-[200px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]"
          aria-label="Search users"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>
      <select
        value={role}
        onChange={handleRoleChange}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)]"
        aria-label="Filter by role"
      >
        {ROLES.map((r) => (
          <option key={r.value || "all"} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
