type AccountTabProps = {
  user: {
    image: string | null;
    username: string | null;
    email: string | null;
  } | null;
  assignedRolesCount: number;
  memberSince: string;
};

export function AccountTab({ user, assignedRolesCount, memberSince }: AccountTabProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Account</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Signed in with Discord. Your profile and access details.</p>
      <div className="mt-6 flex flex-wrap items-start gap-6">
        {user?.image && (
          <img
            src={user.image}
            alt=""
            className="h-20 w-20 rounded-full border-2 border-[var(--color-border)]"
          />
        )}
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Display name</p>
            <p className="mt-1 font-medium text-[var(--color-foreground)]">{user?.username ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Email</p>
            <p className="mt-1 text-[var(--color-foreground)]">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Assigned roles</p>
            <p className="mt-1 text-[var(--color-foreground)]">
              {assignedRolesCount} {assignedRolesCount === 1 ? "role" : "roles"} that can grant product access
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Member since</p>
            <p className="mt-1 text-[var(--color-foreground)]">{memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
