import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { syncUserRolesFromDiscord } from "@/lib/sync-discord-roles";
import { getDownloadableFiles } from "./purchases-list";
import { DashboardStats } from "./dashboard-stats";
import { DashboardTabs } from "./dashboard-tabs";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-[var(--color-muted)]">Could not load your account. Try signing out and back in.</p>
      </div>
    );
  }

  // Re-sync Discord roles so new roles (e.g. after purchase) show up without re-login
  await syncUserRolesFromDiscord(userId);

  const [user, purchases] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.purchase.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            developer: { select: { name: true, slug: true } },
            versions: { orderBy: { releaseDate: "desc" }, include: { file: true } },
            files: { include: { versionRef: true } },
          },
        },
      },
      orderBy: { grantedAt: "desc" },
    }),
  ]);

  const purchaseProductIds = purchases.map((p) => p.product.id);
  const rawRoleIds = user?.accessRoleIds;
  const roleIds: string[] =
    Array.isArray(rawRoleIds)
      ? (rawRoleIds as unknown[]).map((s) => String(s).trim()).filter(Boolean)
      : rawRoleIds != null && typeof rawRoleIds === "string"
        ? [String(rawRoleIds).trim()].filter(Boolean)
        : [];
  const roleIdSet = new Set(roleIds);
  const roleProducts =
    roleIds.length > 0
      ? await prisma.product.findMany({
          where: {
            accessRoleIds: { not: Prisma.JsonNull },
            id: { notIn: purchaseProductIds },
          },
          include: {
            developer: { select: { name: true, slug: true } },
            versions: { orderBy: { releaseDate: "desc" }, include: { file: true } },
            files: { include: { versionRef: true } },
          },
        }).then((products) =>
          products.filter((p) => {
            const productRoleIds = Array.isArray(p.accessRoleIds)
              ? (p.accessRoleIds as unknown[]).map((s) => String(s).trim()).filter(Boolean)
              : [];
            return productRoleIds.some((id) => roleIdSet.has(id));
          })
        )
      : [];

  const accessItems = [
    ...purchases.map((p) => ({ id: p.id, product: p.product })),
    ...roleProducts.map((p) => ({ id: `role-${p.id}`, product: p })),
  ];

  const availableDownloads = accessItems.reduce(
    (sum, item) => sum + getDownloadableFiles(item).length,
    0
  );
  const totalProducts = accessItems.length;
  const memberSince =
    user?.createdAt != null
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";
  const assignedRolesCount = roleIds.length;

  const settings = await getSiteSettings();
  const dashboardSettings = settings.dashboardSettings ?? {};

  return (
    <div className="space-y-8">
      <DashboardStats
        stats={{
          availableDownloads,
          totalProducts,
          memberSince,
          assignedRolesCount,
        }}
        visibility={{
          showStatAvailableDownloads: dashboardSettings.showStatAvailableDownloads,
          showStatTotalProducts: dashboardSettings.showStatTotalProducts,
          showStatMemberSince: dashboardSettings.showStatMemberSince,
          showStatAssignedRoles: dashboardSettings.showStatAssignedRoles,
        }}
      />
      <DashboardTabs
        accessItems={accessItems}
        user={user ? { image: user.image, username: user.username, email: user.email } : null}
        assignedRolesCount={assignedRolesCount}
        memberSince={memberSince}
      />
    </div>
  );
}
