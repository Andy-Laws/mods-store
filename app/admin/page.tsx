import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUptimeMs, formatUptime } from "@/lib/startTime";

async function getHealth(): Promise<{ status: "healthy" | "degraded"; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const hasAuth =
      process.env.NEXTAUTH_SECRET && (process.env.NEXTAUTH_URL || process.env.AUTH_SECRET);
    return {
      status: hasAuth ? "healthy" : "degraded",
      message: hasAuth ? "All systems operational" : "Database OK; check auth env (NEXTAUTH_SECRET, AUTH_SECRET)",
    };
  } catch (e) {
    return {
      status: "degraded",
      message: e instanceof Error ? e.message : "Database connection failed",
    };
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function AdminPage() {
  const [devCount, productCount, userCount, health, totalFileSize, zipFileSize] = await Promise.all([
    prisma.developer.count(),
    prisma.product.count(),
    prisma.user.count(),
    getHealth(),
    prisma.productFile.aggregate({ _sum: { size: true } }).then((r) => r._sum.size ?? 0),
    prisma.productFile
      .aggregate({
        _sum: { size: true },
        where: { filename: { contains: ".zip" } },
      })
      .then((r) => r._sum.size ?? 0),
  ]);

  const uptimeMs = getUptimeMs();
  const uptimeFormatted = formatUptime(uptimeMs);

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--color-foreground)]">Admin Overview</h1>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
        System status and quick links to manage the site.
      </p>

      <section className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          System
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Uptime
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
              {uptimeFormatted}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Process runtime</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Health
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
              <span
                className={
                  health.status === "healthy"
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {health.status === "healthy" ? "Healthy" : "Degraded"}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{health.message}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Total file size
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
              {formatBytes(totalFileSize)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">All product files</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Zip files
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
              {formatBytes(zipFileSize)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">.zip product files only</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Quick links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/developers"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
          >
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Developers</h3>
            <p className="mt-0.5 text-xl font-bold text-[var(--color-primary)]">{devCount}</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Create and edit vendor pages</p>
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
          >
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Products</h3>
            <p className="mt-0.5 text-xl font-bold text-[var(--color-primary)]">{productCount}</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Manage products and versions</p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
          >
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Users</h3>
            <p className="mt-0.5 text-xl font-bold text-[var(--color-primary)]">{userCount}</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Manage users and roles</p>
          </Link>
          <Link
            href="/admin/logs"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
          >
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Logs</h3>
            <p className="mt-0.5 text-xl font-bold text-[var(--color-primary)]">—</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Activity and system logs</p>
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
          >
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Settings</h3>
            <p className="mt-0.5 text-xl font-bold text-[var(--color-primary)]">—</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Site logo, theme, feature flags</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
