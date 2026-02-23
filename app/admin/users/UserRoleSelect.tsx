"use client";

import { useRouter } from "next/navigation";
import { updateUserRole, type UserRole } from "@/app/actions/users";

const ROLES: UserRole[] = ["user", "developer", "admin"];

type Props = {
  userId: string;
  currentRole: string;
  isCurrentUser?: boolean;
};

export function UserRoleSelect({ userId, currentRole, isCurrentUser }: Props) {
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
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isCurrentUser && currentRole === "admin"}
      title={isCurrentUser && currentRole === "admin" ? "You cannot remove your own admin access" : undefined}
      className="rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--color-foreground)] disabled:opacity-60"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
