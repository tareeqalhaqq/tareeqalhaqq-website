import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AcademyPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <p className="eyebrow">Tareeq Al Haqq Academy</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Dedicated Learning Environment</h1>
          <p className="text-base text-white/70">
            The Academy is our bespoke learning portal shaped by decades of structured scholarship. Dive into on-demand lessons, guided reading plans, and live tutorials with our teaching team.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Interactive live sessions", "Classical text syllabi", "Mentorship Q&A", "Resource library"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                {item}
              </div>
            ))}
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary px-8 text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-[1.02]"
          >
            <Link href="https://academy.tareeqalhaqq.org" target="_blank" rel="noreferrer">
              Enter Academy
            </Link>
          </Button>
        </div>
        <div className="glass-panel space-y-4">
          <p className="eyebrow text-left">Access</p>
          <h2 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">How It Works</h2>
          <p className="text-sm text-white/70">
            Enrolled students receive secure access through the academy subdomain. Lessons are released weekly and accompanied by live reflections, downloadable notes, and moderated discussion spaces that echo intimate circles of remembrance.
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-left text-xs uppercase tracking-[0.3em] text-white/60">
            academy.tareeqalhaqq.org
          </div>
        </div>
      </div>
    </section>
  );
}