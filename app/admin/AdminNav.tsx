"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SECTIONS = [
  { label: "Overview", href: "/admin" },
  { label: "Developers", href: "/admin/developers" },
  { label: "Products", href: "/admin/products" },
  { label: "Users", href: "/admin/users" },
  { label: "Logs", href: "/admin/logs" },
  { label: "Settings", href: "/admin/settings" },
] as const;

function currentSectionLabel(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "Overview";
  if (pathname.startsWith("/admin/developers")) return "Developers";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/logs")) return "Logs";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Overview";
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = currentSectionLabel(pathname);

  return (
    <nav className="flex flex-col gap-0.5">
      <label className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
        Section
      </label>
      <select
        value={current}
        onChange={(e) => {
          const item = SECTIONS.find((s) => s.label === e.target.value);
          if (item) router.push(item.href);
        }}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm font-medium text-[var(--color-foreground)]"
      >
        {SECTIONS.map((s) => (
          <option key={s.href} value={s.label}>
            {s.label}
          </option>
        ))}
      </select>
      <div className="mt-2 flex flex-col gap-0.5 border-t border-[var(--color-border)] pt-2">
        {SECTIONS.map((s) => {
          const isActive =
            s.href === "/admin"
              ? pathname === "/admin" || pathname === "/admin/"
              : pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={
                "rounded px-2 py-1.5 text-sm font-medium " +
                (isActive
                  ? "bg-[var(--color-border)] text-[var(--color-foreground)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]")
              }
            >
              {s.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/"
        className="mt-3 rounded px-2 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        ← Back to site
      </Link>
    </nav>
  );
}
