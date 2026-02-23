import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      developer: { select: { name: true, slug: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Add product
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Product</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Developer</th>
              <th className="px-3 py-2 text-left font-medium text-[var(--color-foreground)]">Published</th>
              <th className="px-3 py-2 text-right font-medium text-[var(--color-foreground)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-border)]">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? (
                      <img
                        src={p.images[0].url}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded border border-[var(--color-border)] object-cover"
                      />
                    ) : (
                      <div className="h-10 w-14 shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-surface)]" />
                    )}
                    <span className="font-medium text-[var(--color-foreground)]">{p.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-[var(--color-muted)]">{p.developer.name}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      p.published
                        ? "rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400"
                        : "rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]"
                    }
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <p className="mt-6 text-[var(--color-muted)]">No products. Add a developer first, then add products.</p>
      )}
    </div>
  );
}
