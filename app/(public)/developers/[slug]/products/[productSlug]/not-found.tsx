import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-[var(--color-foreground)]">Product not found</h1>
      <p className="mt-2 text-[var(--color-muted)]">This product does not exist or is not published.</p>
      <Link href="/developers" className="mt-6 inline-block text-[var(--color-primary)] hover:underline">
        Browse developers
      </Link>
    </div>
  );
}
