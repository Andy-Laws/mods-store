import Link from "next/link";
import { VersionDownloadSelect } from "./version-download-select";

export type Purchase = {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    developer: { name: string; slug: string };
    versions: { id: string; version: string; fileId: string | null; file: { id: string; filename: string } | null }[];
    files: { id: string; filename: string; versionRef: { id: string } | null }[];
  };
};

export function getDownloadableFiles(p: Purchase): { id: string; label: string; isMain: boolean }[] {
  const product = p.product;
  const versionWithFile = product.versions.find((v) => v.file);
  const directFiles = product.files.filter((f) => !f.versionRef);
  const mainFile = versionWithFile?.file ?? directFiles[0];
  const links: { id: string; label: string; isMain: boolean }[] = [];

  if (mainFile) {
    links.push({ id: mainFile.id, label: "Download (main)", isMain: true });
  }
  for (const v of product.versions) {
    if (v.file && v.file.id !== mainFile?.id) {
      links.push({ id: v.file.id, label: `Download: ${v.file.filename}`, isMain: false });
    }
  }
  for (const f of directFiles) {
    if (f.id !== mainFile?.id) {
      links.push({ id: f.id, label: `Download: ${f.filename}`, isMain: false });
    }
  }
  return links;
}

export function PurchasesList({ purchases }: { purchases: Purchase[] }) {
  if (purchases.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-muted)]">
        You have no products to download yet. Purchase via Discord or get access by role from an admin.
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {purchases.map((p) => {
        const downloadLinks = getDownloadableFiles(p);
        return (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)]/30"
          >
            <div>
              <Link
                href={`/developers/${p.product.developer.slug}/products/${p.product.slug}`}
                className="font-medium text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
              >
                {p.product.name}
              </Link>
              <p className="text-sm text-[var(--color-muted)]">{p.product.developer.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {downloadLinks.length === 0 ? (
                <span className="text-sm text-[var(--color-muted)]">No files yet</span>
              ) : downloadLinks.length === 1 ? (
                <a
                  href={`/api/download?productId=${p.product.id}&fileId=${downloadLinks[0].id}`}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Download
                </a>
              ) : (
                <VersionDownloadSelect
                  productId={p.product.id}
                  options={downloadLinks.map((l) => ({
                    fileId: l.id,
                    label: l.isMain ? "Latest" : l.label.replace(/^Download: /, ""),
                  }))}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
