import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="glass-panel w-full max-w-2xl space-y-6 text-center">
          <p className="eyebrow text-primary">Page not found</p>
          <h1 className="text-3xl font-headline uppercase tracking-[0.2em] text-white md:text-4xl">
            The page you requested isn&apos;t here
          </h1>
          <p className="text-base text-white/70">
            The link may be outdated or the page might have moved. Choose one of the options below to get back on track.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-full px-8 py-6 uppercase tracking-[0.22em]">
              <Link href="/">Return Home</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 px-8 py-6 uppercase tracking-[0.22em] text-white"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
