"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/admin-log";

// User access role IDs are synced automatically from Discord on sign-in (and when
// loading the dashboard if DISCORD_BOT_TOKEN is set). There is no manual editing;
// admins only add role IDs to products.

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

const ROLES = ["user", "developer", "admin"] as const;
export type UserRole = (typeof ROLES)[number];

export async function updateUserRole(userId: string, role: UserRole) {
  const session = await requireAdmin();
  const currentUserId = (session.user as { id?: string }).id;
  if (currentUserId === userId && role !== "admin") {
    throw new Error("You cannot remove your own admin access.");
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true, email: true } });
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  await logActivity({
    action: "user.role_change",
    message: `User role set to ${role}${user ? ` (${user.username ?? user.email ?? userId})` : ""}`,
    meta: { userId, role },
    userId: currentUserId,
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUser(userId: string): Promise<{ ok: true } | { error: string }> {
  const session = await requireAdmin();
  const currentUserId = (session.user as { id?: string }).id;
  if (currentUserId === userId) {
    return { error: "You cannot delete your own account." };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { purchases: true, developers: true } },
    },
  });
  if (!user) return { error: "User not found." };
  if (user._count.purchases > 0 || user._count.developers > 0) {
    return {
      error: "Cannot delete user: they have purchases or linked developers. Remove or reassign them first.",
    };
  }
  const displayName = user.username ?? user.email ?? userId;
  await prisma.user.delete({ where: { id: userId } });
  await logActivity({
    action: "user.delete",
    message: `User "${displayName}" deleted`,
    meta: { userId },
    userId: currentUserId,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}
