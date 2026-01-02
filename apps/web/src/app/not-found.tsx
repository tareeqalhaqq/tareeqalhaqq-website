import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-white">
      <div className="glass-panel w-full max-w-2xl space-y-6 text-center">
        <p className="eyebrow text-primary">Page not found</p>
        <h1 className="text-3xl font-headline uppercase tracking-[0.2em] text-white md:text-4xl">
          The page you requested isn&apos;t here
        </h1>
        <p className="text-base text-white/70">
          The link may be outdated or the page might have moved. Choose one of the options below to get back on track.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90"
          >
            Return Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
