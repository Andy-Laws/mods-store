import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserAccessRoleIdsDisplay } from "./user-access-role-ids-form";
import { UserRoleForm } from "./UserRoleForm";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true, role: true, accessRoleIds: true },
    }),
    getServerSession(authOptions),
  ]);
  if (!user) notFound();

  const currentUserId = (session?.user as { id?: string })?.id;
  const roleIds = Array.isArray(user.accessRoleIds)
    ? (user.accessRoleIds as unknown[]).map((s) => String(s).trim()).filter(Boolean)
    : [];

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        ← Users
      </Link>
      <h1 className="mt-3 text-xl font-bold text-[var(--color-foreground)]">
        {user.username ?? user.email ?? "User"}
      </h1>
      {user.email && user.username !== user.email && (
        <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
      )}
      <UserRoleForm
        userId={user.id}
        currentRole={user.role}
        isCurrentUser={user.id === currentUserId}
      />
      <UserAccessRoleIdsDisplay accessRoleIds={roleIds} />
      <DeleteUserButton userId={user.id} isCurrentUser={user.id === currentUserId} />
    </div>
  );
}
