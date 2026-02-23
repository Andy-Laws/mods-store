export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-lg bg-[var(--color-surface)]" />
        <div className="h-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
