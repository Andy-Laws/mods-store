"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createDeveloper, updateDeveloper, deleteDeveloper } from "@/app/actions/developers";
import { uploadDeveloperLogo, uploadDeveloperBanner } from "@/app/actions/upload";
import type { Developer } from "@/app/generated/prisma/client";

export function DeveloperForm({ developer }: { developer?: Developer }) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(developer?.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(developer?.bannerUrl ?? "");
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);

  const social = (developer?.socialLinks ?? {}) as { discord?: string; twitter?: string; website?: string };

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadError(null);
    setUploading("logo");
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadDeveloperLogo(formData);
    if ("url" in result) setLogoUrl(result.url);
    else setLogoUploadError(result.error);
    setUploading(null);
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploadError(null);
    setUploading("banner");
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadDeveloperBanner(formData);
    if ("url" in result) setBannerUrl(result.url);
    else setBannerUploadError(result.error);
    setUploading(null);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("logoUrl", logoUrl);
    formData.set("bannerUrl", bannerUrl);
    if (developer) {
      await updateDeveloper(developer.id, formData);
    } else {
      await createDeveloper(formData);
    }
    router.push("/admin/developers");
    setTimeout(() => router.refresh(), 0);
  }

  async function handleDelete() {
    if (!developer || !confirm("Delete this developer and all their products?")) return;
    setDeleting(true);
    await deleteDeveloper(developer.id);
    router.push("/admin/developers");
    setTimeout(() => router.refresh(), 0);
  }

  return (
    <form action={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={developer?.name}
          required
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Slug (URL)</label>
        <input
          type="text"
          name="slug"
          defaultValue={developer?.slug}
          required
          pattern="[a-z0-9-]+"
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-[var(--color-foreground)]"
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">Lowercase letters, numbers, hyphens only.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Logo</label>
        {logoUploadError && (
          <p className="mt-1 text-sm text-red-500" role="alert">{logoUploadError}</p>
        )}
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <div className="mt-1 flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt="" className="h-16 w-16 rounded-lg object-cover border border-[var(--color-border)]" />
          )}
          <label className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-border)]">
            {uploading === "logo" ? "Uploading…" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={!!uploading} />
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Banner</label>
        {bannerUploadError && (
          <p className="mt-1 text-sm text-red-500" role="alert">{bannerUploadError}</p>
        )}
        <input type="hidden" name="bannerUrl" value={bannerUrl} />
        <div className="mt-1 flex items-center gap-4">
          {bannerUrl && (
            <img src={bannerUrl} alt="" className="h-20 w-40 rounded-lg object-cover border border-[var(--color-border)]" />
          )}
          <label className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-border)]">
            {uploading === "banner" ? "Uploading…" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} disabled={!!uploading} />
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Description</label>
        <textarea
          name="description"
          defaultValue={developer?.description ?? undefined}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Discord URL</label>
          <input
            type="url"
            name="socialDiscord"
            defaultValue={social.discord}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Twitter URL</label>
          <input
            type="url"
            name="socialTwitter"
            defaultValue={social.twitter}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Website</label>
          <input
            type="url"
            name="socialWebsite"
            defaultValue={social.website}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {developer ? "Save" : "Create"}
        </button>
        <Link
          href="/admin/developers"
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
        >
          Cancel
        </Link>
        {developer && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
