import Link from "next/link";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 50;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type === "activity" || params.type === "system" ? params.type : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      where: typeFilter ? { type: typeFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        user: { select: { username: true, email: true } },
      },
    }),
    prisma.adminLog.count({
      where: typeFilter ? { type: typeFilter } : undefined,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--color-foreground)]">Logs</h1>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
        Activity and system logs. Filter by type or browse recent entries.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--color-foreground)]">Filter:</span>
        <Link
          href="/admin/logs"
          className={
            "rounded-lg border px-3 py-1.5 text-sm " +
            (!typeFilter
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-foreground)]"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]")
          }
        >
          All
        </Link>
        <Link
          href="/admin/logs?type=activity"
          className={
            "rounded-lg border px-3 py-1.5 text-sm " +
            (typeFilter === "activity"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-foreground)]"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]")
          }
        >
          Activity
        </Link>
        <Link
          href="/admin/logs?type=system"
          className={
            "rounded-lg border px-3 py-1.5 text-sm " +
            (typeFilter === "system"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-foreground)]"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]")
          }
        >
          System
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Time</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Type</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Action</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Message</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Actor</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-[var(--color-border)]">
                <td className="whitespace-nowrap px-3 py-2 text-[var(--color-muted)]">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      "rounded px-2 py-0.5 text-xs font-medium " +
                      (log.type === "activity"
                        ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400")
                    }
                  >
                    {log.type}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-[var(--color-foreground)]">{log.action}</td>
                <td className="max-w-md truncate px-3 py-2 text-[var(--color-foreground)]" title={log.message}>
                  {log.message}
                </td>
                <td className="px-3 py-2 text-[var(--color-muted)]">
                  {log.user ? log.user.username ?? log.user.email ?? "—" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">No log entries yet.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          {hasPrev && (
            <Link
              href={
                typeFilter
                  ? `/admin/logs?type=${typeFilter}&page=${page - 1}`
                  : `/admin/logs?page=${page - 1}`
              }
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-[var(--color-muted)]">
            Page {page} of {totalPages}
          </span>
          {hasNext && (
            <Link
              href={
                typeFilter
                  ? `/admin/logs?type=${typeFilter}&page=${page + 1}`
                  : `/admin/logs?page=${page + 1}`
              }
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
