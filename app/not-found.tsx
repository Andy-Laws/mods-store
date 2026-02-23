import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">404</h1>
      <p className="text-[var(--color-muted)]">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
