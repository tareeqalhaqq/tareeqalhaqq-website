import Link from "next/link";

export default function ServerErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-white">
      <div className="glass-panel w-full max-w-2xl space-y-6 text-center">
        <p className="eyebrow text-primary">Server error</p>
        <h1 className="text-3xl font-headline uppercase tracking-[0.2em] text-white md:text-4xl">
          We&apos;ll be back soon
        </h1>
        <p className="text-base text-white/70">
          The site hit an unexpected error. Please try again later or return home.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/40 hover:bg-white/10"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
