import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <aside className="w-48 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
