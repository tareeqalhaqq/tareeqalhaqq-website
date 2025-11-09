import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AcademyPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner space-y-12">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Tareeq Al Haqq Academy</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Launching 2026</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            The Academy will extend the Tareeq Al Haqq platform with structured courses, guided readings, and collaborative cohorts built around authenticated sources. Until launch, explore the app and resources already available.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="glass-panel space-y-6 text-left text-white/80">
            <p>
              Our digital classrooms will combine live seminars, moderated discussions, and integrated note-taking so students can study efficiently with teachers and peers worldwide.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Structured study paths", "Verified reading packs", "Interactive assessments", "Shared annotations"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel space-y-4">
            <p className="eyebrow text-left">Access</p>
            <h2 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">Getting Ready</h2>
            <p className="text-sm text-white/70">
              Academy accounts will open in 2026. To access the academy, go here once the portal is live: academy.tareeqalhaqq.org.
            </p>
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-left text-xs uppercase tracking-[0.3em] text-white/60">
              academy.tareeqalhaqq.org
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Join the mailing list for launch updates and early onboarding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
