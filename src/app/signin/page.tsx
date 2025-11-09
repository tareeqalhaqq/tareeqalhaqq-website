import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-3xl space-y-10 text-center">
        <div className="space-y-4">
          <p className="eyebrow">Member Access</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Sign In</h1>
          <p className="text-base text-white/70">
            Access your Tareeq Al Haqq learning portal, track course progress, and join live sessions via the academy dashboard.
          </p>
        </div>
        <div className="glass-panel space-y-6 text-left">
          <p className="text-sm text-white/70">
            Sign-in is managed through the Academy platform. Use the dedicated portal below to log in with your enrolment credentials.
          </p>
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-[1.02]"
          >
            <Link href="https://academy.tareeqalhaqq.org/login" target="_blank" rel="noreferrer">
              Go to Academy Login
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}