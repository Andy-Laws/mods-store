import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@/app/generated/prisma/client";
import { UserRoleSelect } from "./UserRoleSelect";
import { UsersFilters } from "./UsersFilters";

function buildWhere(q: string | null, role: string | null) {
  const conditions: object[] = [];
  if (q?.trim()) {
    conditions.push({
      OR: [
        { email: { contains: q.trim() } },
        { username: { contains: q.trim() } },
      ],
    });
  }
  if (role && (role === "user" || role === "developer" || role === "admin")) {
    conditions.push({ role: role as Role });
  }
  return conditions.length > 0 ? { AND: conditions } : {};
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? null;
  const role = params.role ?? null;
  const where = buildWhere(q, role);

  const [users, session] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" } }),
    getServerSession(authOptions),
  ]);
  const currentUserId = (session?.user as { id?: string })?.id;

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--color-foreground)]">Users</h1>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
        Manage roles (user, developer, admin). Access role IDs are synced from Discord.
      </p>
      <UsersFilters />
      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">User</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Role</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Access role IDs</th>
              <th className="px-3 py-2 text-right font-medium text-[var(--color-foreground)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--color-border)]">
                <td className="px-3 py-2">
                  <span className="font-medium text-[var(--color-foreground)]">{u.username ?? u.email ?? u.id}</span>
                  {u.email && u.username !== u.email && (
                    <span className="ml-2 text-[var(--color-muted)]">{u.email}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <UserRoleSelect
                    userId={u.id}
                    currentRole={u.role}
                    isCurrentUser={u.id === currentUserId}
                  />
                </td>
                <td className="px-3 py-2 text-[var(--color-muted)]">
                  {u.accessRoleIds != null && Array.isArray(u.accessRoleIds) && (u.accessRoleIds as string[]).length > 0
                    ? (u.accessRoleIds as string[]).join(", ")
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/users/${u.id}`} className="text-[var(--color-primary)] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          {q || role ? "No users match the current search or filters." : "No users yet."}
        </p>
      )}
    </div>
  );
}
