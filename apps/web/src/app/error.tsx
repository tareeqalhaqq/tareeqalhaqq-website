"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-white">
      <div className="glass-panel w-full max-w-2xl space-y-6 text-center">
        <p className="eyebrow text-primary">Something went wrong</p>
        <h1 className="text-3xl font-headline uppercase tracking-[0.2em] text-white md:text-4xl">
          We couldn&apos;t load this page
        </h1>
        <p className="text-base text-white/70">
          Please try again. If the issue persists, return home or contact support.
        </p>
        {error?.digest && (
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
