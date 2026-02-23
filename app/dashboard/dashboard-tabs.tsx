"use client";

import { useState } from "react";
import { PurchasesList } from "./purchases-list";
import { AccountTab } from "./account-tab";
import type { Purchase } from "./purchases-list";

type TabId = "overview" | "account";

type DashboardTabsProps = {
  accessItems: Purchase[];
  user: {
    image: string | null;
    username: string | null;
    email: string | null;
  } | null;
  assignedRolesCount: number;
  memberSince: string;
};

export function DashboardTabs({
  accessItems,
  user,
  assignedRolesCount,
  memberSince,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "account", label: "Account" },
  ];

  return (
    <section>
      <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={
              activeTab === id
                ? "rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
                : "rounded-md px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Products you can access</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            By purchase or by role. Use the links below to download.
          </p>
          {accessItems.length === 0 && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              You don’t have access to any products yet. If you have a Discord role that should grant access, sign out
              and sign in again so your roles sync automatically.
            </p>
          )}
          <PurchasesList purchases={accessItems} />
        </div>
      )}

      {activeTab === "account" && (
        <div className="mt-6">
          <AccountTab
            user={user}
            assignedRolesCount={assignedRolesCount}
            memberSince={memberSince}
          />
        </div>
      )}
    </section>
  );
}
