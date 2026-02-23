"use client";

import { useState } from "react";

type Image = { id: string; url: string; alt: string | null };

export function ProductGallery({ images, productName }: { images: Image[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const displayImages = images.length > 0 ? images : [];
  const mainImage = displayImages[selectedIndex];

  if (displayImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="aspect-video flex items-center justify-center bg-[var(--color-border)] text-[var(--color-muted)]">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="aspect-video bg-[var(--color-border)]">
        <img
          src={mainImage.url}
          alt={mainImage.alt ?? productName}
          className="h-full w-full object-cover"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {displayImages.slice(0, 6).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === selectedIndex
                  ? "border-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-muted)]"
              }`}
            >
              <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
