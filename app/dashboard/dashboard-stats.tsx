export type DashboardStats = {
  availableDownloads: number;
  totalProducts: number;
  memberSince: string;
  assignedRolesCount: number;
};

export type DashboardStatVisibility = {
  showStatAvailableDownloads?: boolean;
  showStatTotalProducts?: boolean;
  showStatMemberSince?: boolean;
  showStatAssignedRoles?: boolean;
};

const defaultVisibility: Required<DashboardStatVisibility> = {
  showStatAvailableDownloads: true,
  showStatTotalProducts: true,
  showStatMemberSince: true,
  showStatAssignedRoles: true,
};

export function DashboardStats({
  stats,
  visibility,
}: {
  stats: DashboardStats;
  visibility?: DashboardStatVisibility | null;
}) {
  const vis = { ...defaultVisibility, ...visibility };
  const cards: { label: string; value: string | number; show: boolean }[] = [
    { label: "Available Downloads", value: stats.availableDownloads, show: vis.showStatAvailableDownloads },
    { label: "Total Products", value: stats.totalProducts, show: vis.showStatTotalProducts },
    { label: "Member Since", value: stats.memberSince, show: vis.showStatMemberSince },
    { label: "Assigned Roles", value: stats.assignedRolesCount, show: vis.showStatAssignedRoles },
  ].filter((c) => c.show);

  if (cards.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-primary)]/40 hover:shadow-[0_0_20px_-8px_var(--color-primary)]"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: `linear-gradient(135deg, var(--color-primary) 0%, transparent 50%)`,
            }}
          />
          <p className="relative text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{value}</p>
          <p className="relative mt-1 text-sm text-[var(--color-muted)]">{label}</p>
        </div>
      ))}
    </div>
  );
}
