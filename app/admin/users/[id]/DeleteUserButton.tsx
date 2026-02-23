"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUser } from "@/app/actions/users";

export function DeleteUserButton({
  userId,
  isCurrentUser,
}: {
  userId: string;
  isCurrentUser: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCurrentUser) return null;

  async function handleDelete() {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    const result = await deleteUser(userId);
    if ("ok" in result) {
      router.push("/admin/users");
      setTimeout(() => router.refresh(), 0);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
      <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Danger zone</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Permanently delete this user. They will lose access and cannot be recovered.
      </p>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="mt-3 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Delete user"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
