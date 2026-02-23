"use client";

import { useRouter } from "next/navigation";
import { updateUserRole, type UserRole } from "@/app/actions/users";

const ROLES: UserRole[] = ["user", "developer", "admin"];

type Props = {
  userId: string;
  currentRole: string;
  isCurrentUser?: boolean;
};

export function UserRoleForm({ userId, currentRole, isCurrentUser }: Props) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as UserRole;
    if (!ROLES.includes(role)) return;
    try {
      await updateUserRole(userId, role);
      router.refresh();
    } catch {
      // e.g. "You cannot remove your own admin access"
    }
  }

  return (
    <div className="mt-4 max-w-xl">
      <label className="block text-sm font-medium text-[var(--color-foreground)]">Role</label>
      <select
        value={currentRole}
        onChange={handleChange}
        disabled={isCurrentUser && currentRole === "admin"}
        title={isCurrentUser && currentRole === "admin" ? "You cannot remove your own admin access" : undefined}
        className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)] disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-[var(--color-muted)]">Admin can manage the site; developer can be linked to a developer page.</p>
    </div>
  );
}
