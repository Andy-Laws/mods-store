"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  removeProductImage,
  addProductVersion,
  addProductFile,
  removeProductFile,
} from "@/app/actions/products";
import { uploadProductImage, uploadProductFile } from "@/app/actions/upload";
import type { Product, ProductImage, ProductVersion, ProductFile, Developer } from "@/app/generated/prisma/client";

export function ProductForm({
  product,
  developers,
}: {
  product?: Product & {
    images: ProductImage[];
    versions: (ProductVersion & { file?: ProductFile | null })[];
    files: (ProductFile & { versionRef?: { id: string } | null })[];
  };
  developers: Developer[];
}) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newVersion, setNewVersion] = useState({ version: "", changelog: "", file: null as File | null });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingDirectFile, setUploadingDirectFile] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [directFileUploadError, setDirectFileUploadError] = useState<string | null>(null);

  const directFiles = (product?.files ?? []).filter((f) => !f.versionRef);

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setImageUploadError(null);
    setUploadingImg(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImage(formData);
    if ("url" in result) {
      await addProductImage(product.id, result.url, null, imageUrls.length);
      setImageUrls((prev) => [...prev, result.url]);
    } else {
      setImageUploadError(result.error);
    }
    setUploadingImg(false);
  }

  async function handleRemoveImage(url: string) {
    if (!product) return;
    const img = product.images.find((i) => i.url === url);
    if (img) await removeProductImage(img.id);
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleAddVersion() {
    if (!product || !newVersion.version.trim()) return;
    setFileUploadError(null);
    setUploadingFile(true);
    let fileId: string | null = null;
    if (newVersion.file?.size) {
      const formData = new FormData();
      formData.set("file", newVersion.file);
      const result = await uploadProductFile(formData);
      if ("url" in result) {
        fileId = await addProductFile(product.id, {
          blobUrl: result.url,
          filename: newVersion.file.name,
          size: newVersion.file.size,
          mimeType: newVersion.file.type || undefined,
        });
      } else {
        setFileUploadError(result.error);
        setUploadingFile(false);
        return;
      }
    }
    await addProductVersion(product.id, {
      version: newVersion.version,
      changelog: newVersion.changelog || null,
      fileId,
    });
    setNewVersion({ version: "", changelog: "", file: null });
    setUploadingFile(false);
    router.refresh();
  }

  async function handleAddDirectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setDirectFileUploadError(null);
    setUploadingDirectFile(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductFile(formData);
    if ("url" in result) {
      await addProductFile(product.id, {
        blobUrl: result.url,
        filename: file.name,
        size: file.size,
        mimeType: file.type || undefined,
      });
      router.refresh();
    } else {
      setDirectFileUploadError(result.error);
    }
    e.target.value = "";
    setUploadingDirectFile(false);
  }

  async function handleRemoveDirectFile(fileId: string) {
    if (!product) return;
    await removeProductFile(fileId);
    router.refresh();
  }

  async function handleSubmit(formData: FormData) {
    if (product) {
      await updateProduct(product.id, formData);
      router.push("/admin/products");
    } else {
      const result = await createProduct(formData);
      if (result?.id) {
        router.push(`/admin/products/${result.id}/edit`);
      } else {
        router.push("/admin/products");
      }
    }
    setTimeout(() => router.refresh(), 0);
  }

  async function handleDelete() {
    if (!product || !confirm("Delete this product?")) return;
    setDeleting(true);
    await deleteProduct(product.id);
    router.push("/admin/products");
    setTimeout(() => router.refresh(), 0);
  }

  return (
    <form action={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      {!product && (
        <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)]">
          After creating the product, you’ll be taken to the edit page to add images, versions, direct files, and grant access.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Developer</label>
        <select
          name="developerId"
          defaultValue={product?.developerId}
          required
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
        >
          {developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={product?.name}
          required
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Slug</label>
        <input
          type="text"
          name="slug"
          defaultValue={product?.slug}
          required
          pattern="[a-z0-9-]+"
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-[var(--color-foreground)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Short description</label>
        <textarea
          name="shortDescription"
          defaultValue={product?.shortDescription ?? undefined}
          rows={2}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)]">Long description</label>
        <textarea
          name="longDescription"
          defaultValue={product?.longDescription ?? undefined}
          rows={5}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Price</label>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            defaultValue={product?.price != null ? Number(product.price) : undefined}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Version</label>
          <input
            type="text"
            name="version"
            defaultValue={product?.version ?? undefined}
            placeholder="1.0.0"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-foreground)]"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={product?.published}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <label htmlFor="published" className="text-sm text-[var(--color-foreground)]">
          Published (visible on site)
        </label>
      </div>
      {product && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Product images</label>
            {imageUploadError && (
              <p className="mt-1 text-sm text-red-500" role="alert">{imageUploadError}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {imageUrls.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-28 rounded-lg border object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface)]">
                {uploadingImg ? "Uploading…" : "+ Add"}
                <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} disabled={uploadingImg} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Versions / Changelog</label>
            <ul className="mt-2 space-y-2">
              {product.versions.map((v) => (
                <li key={v.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                  <span className="font-medium">v{v.version}</span>
                  {v.changelog && <span className="ml-2 text-[var(--color-muted)]">— {v.changelog.slice(0, 60)}{v.changelog.length > 60 ? "…" : ""}</span>}
                  {v.file && (
                    <span className="ml-2 text-[var(--color-muted)]">
                      · File: {v.file.filename}
                      {v.file.size != null && ` (${(v.file.size / 1024).toFixed(1)} KB)`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {fileUploadError && (
              <p className="mt-2 text-sm text-red-500" role="alert">{fileUploadError}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Version (e.g. 1.0.0)"
                value={newVersion.version}
                onChange={(e) => setNewVersion((prev) => ({ ...prev, version: e.target.value }))}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Changelog"
                value={newVersion.changelog}
                onChange={(e) => setNewVersion((prev) => ({ ...prev, changelog: e.target.value }))}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              />
              <label className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-surface)]">
                {newVersion.file ? newVersion.file.name : "Attach file"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setNewVersion((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                />
              </label>
              <button
                type="button"
                onClick={handleAddVersion}
                disabled={uploadingFile || !newVersion.version.trim()}
                className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {uploadingFile ? "Adding…" : "Add version"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">Direct product files</label>
            {directFileUploadError && (
              <p className="mt-1 text-sm text-red-500" role="alert">{directFileUploadError}</p>
            )}
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Add zip or other files directly to this product (not tied to a version). Customers with access can download any of these.
            </p>
            <ul className="mt-2 space-y-2">
              {directFiles.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                >
                  <span className="truncate text-[var(--color-foreground)]">{f.filename}</span>
                  {f.size != null && (
                    <span className="text-[var(--color-muted)]">{(f.size / 1024).toFixed(1)} KB</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveDirectFile(f.id)}
                    className="shrink-0 rounded bg-red-500/10 px-2 py-1 text-xs text-red-500 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-surface)]">
              {uploadingDirectFile ? "Uploading…" : "+ Add file (e.g. .zip)"}
              <input
                type="file"
                className="hidden"
                accept=".zip,application/zip,application/x-zip-compressed,*/*"
                onChange={handleAddDirectFile}
                disabled={uploadingDirectFile}
              />
            </label>
          </div>
        </>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {product ? "Save" : "Create"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
        >
          Cancel
        </Link>
        {product && (
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
