"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  grantProductAccess,
  revokeProductAccess,
  addProductAccessRoleId,
  removeProductAccessRoleId,
} from "@/app/actions/products";

type Purchase = {
  id: string;
  userId: string;
  user: { id: string; email: string | null; username: string | null };
};

export function GrantAccess({
  productId,
  purchases,
  accessRoleIds,
}: {
  productId: string;
  purchases: Purchase[];
  accessRoleIds: string[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [newRoleId, setNewRoleId] = useState("");
  const [roleIdStatus, setRoleIdStatus] = useState<"idle" | "loading" | "error">("idle");
  const [roleIdMessage, setRoleIdMessage] = useState("");
  const [revokingRoleId, setRevokingRoleId] = useState<string | null>(null);

  async function handleGrant() {
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    const result = await grantProductAccess(productId, email.trim());
    if ("ok" in result) {
      setStatus("success");
      setMessage("Access granted.");
      setEmail("");
      router.refresh();
    } else {
      setStatus("error");
      setMessage(result.error);
    }
    setStatus("idle");
  }

  async function handleRevoke(userId: string) {
    if (!confirm("Revoke this user's access to the product?")) return;
    setRevokingId(userId);
    await revokeProductAccess(productId, userId);
    setRevokingId(null);
    router.refresh();
  }

  async function handleAddRoleId() {
    if (!newRoleId.trim()) return;
    setRoleIdStatus("loading");
    setRoleIdMessage("");
    const result = await addProductAccessRoleId(productId, newRoleId.trim());
    if ("ok" in result) {
      setNewRoleId("");
      router.refresh();
    } else {
      setRoleIdStatus("error");
      setRoleIdMessage(result.error);
    }
    setRoleIdStatus("idle");
  }

  async function handleRemoveRoleId(roleId: string) {
    setRevokingRoleId(roleId);
    await removeProductAccessRoleId(productId, roleId);
    setRevokingRoleId(null);
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Grant access</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Give a user access to this product (by their Discord account email). They will see it in Dashboard and can download.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleGrant}
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {status === "loading" ? "Granting…" : "Grant access"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${status === "error" ? "text-red-500" : "text-[var(--color-muted)]"}`}>
          {message}
        </p>
      )}

      {purchases.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[var(--color-foreground)]">Users with access</h3>
          <ul className="mt-2 space-y-2">
            {purchases.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--color-foreground)]">
                  {p.user.email ?? p.user.username ?? p.user.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleRevoke(p.userId)}
                  disabled={revokingId === p.userId}
                  className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-500 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {revokingId === p.userId ? "Revoking…" : "Revoke"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 border-t border-[var(--color-border)] pt-6">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">Access by role</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Users who have any of these role IDs (set in Admin → Users) can download without a purchase.
        </p>
        {accessRoleIds.length > 0 && (
          <ul className="mt-2 space-y-2">
            {accessRoleIds.map((roleId) => (
              <li
                key={roleId}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <span className="font-mono text-[var(--color-foreground)]">{roleId}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRoleId(roleId)}
                  disabled={revokingRoleId === roleId}
                  className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-500 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {revokingRoleId === roleId ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={newRoleId}
            onChange={(e) => setNewRoleId(e.target.value)}
            placeholder="e.g. Discord role ID"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAddRoleId}
            disabled={roleIdStatus === "loading"}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {roleIdStatus === "loading" ? "Adding…" : "Add role ID"}
          </button>
        </div>
        {roleIdMessage && (
          <p className="mt-2 text-sm text-red-500">{roleIdMessage}</p>
        )}
      </div>
    </div>
  );
}
