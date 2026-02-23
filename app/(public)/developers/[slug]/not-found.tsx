import Link from "next/link";

export default function DeveloperNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-[var(--color-foreground)]">Developer not found</h1>
      <p className="mt-2 text-[var(--color-muted)]">This developer page does not exist or was removed.</p>
      <Link href="/developers" className="mt-6 inline-block text-[var(--color-primary)] hover:underline">
        Browse developers
      </Link>
    </div>
  );
}
