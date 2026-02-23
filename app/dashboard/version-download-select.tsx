"use client";

import { useState } from "react";

type Option = { fileId: string; label: string };

type VersionDownloadSelectProps = {
  productId: string;
  options: Option[];
};

export function VersionDownloadSelect({ productId, options }: VersionDownloadSelectProps) {
  const [selectedFileId, setSelectedFileId] = useState(options[0]?.fileId ?? "");

  if (options.length === 0) return null;

  const downloadUrl = `/api/download?productId=${productId}&fileId=${selectedFileId}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={selectedFileId}
        onChange={(e) => setSelectedFileId(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        {options.map((opt) => (
          <option key={opt.fileId} value={opt.fileId}>
            {opt.label}
          </option>
        ))}
      </select>
      <a
        href={downloadUrl}
        className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Download
      </a>
    </div>
  );
}
