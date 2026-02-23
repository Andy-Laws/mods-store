"use client";

export function UserAccessRoleIdsDisplay({ accessRoleIds }: { accessRoleIds: string[] }) {
  const display =
    accessRoleIds.length > 0 ? accessRoleIds.join(", ") : "No roles (synced from Discord on sign-in)";

  return (
    <div className="mt-4 max-w-xl space-y-1.5">
      <h2 className="text-sm font-medium text-[var(--color-foreground)]">
        Access role IDs (from Discord)
      </h2>
      <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-foreground)]">
        {display}
      </p>
      <p className="text-sm text-[var(--color-muted)]">
        These are synced automatically when the user signs in. To grant access, add the Discord role ID to the product and assign that role in your Discord server. No manual editing of users.
      </p>
    </div>
  );
}
