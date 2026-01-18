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
            The Academy will extend the Tareeq Al Haqq platform with structured courses, guided readings, and collaborative cohorts built around authenticated sources. Expect a full curriculum that blends live instruction, scholar-vetted materials, and consistent mentorship so learners can progress with clarity from foundations to advanced study.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="glass-panel space-y-6 text-left text-white/80">
            <p>
              Our digital classrooms will combine live seminars, moderated discussions, and integrated note-taking so students can study efficiently with teachers and peers worldwide. Every cohort will receive a structured learning plan, weekly milestones, and feedback from qualified instructors to keep progress steady.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Structured study paths",
                "Verified reading packs",
                "Interactive assessments",
                "Shared annotations",
                "Live seminars and replay library",
                "Mentor-led study circles",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              The Markaz Al Haqq academy experience is directed by Mustafa Asif, with scholars from the New Jersey and Pennsylvania area, ensuring the learning track stays anchored to authentic sources and a supportive student journey.
            </p>
          </div>
          <div className="glass-panel space-y-4">
            <p className="eyebrow text-left">Access</p>
            <h2 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">Getting Ready</h2>
            <p className="text-sm text-white/70">
              Academy accounts will open in 2026. Visit the academy site once the portal is live.
            </p>
            <Button asChild className="w-full rounded-2xl text-xs uppercase tracking-[0.3em]">
              <Link href="https://markazalhaqq.org" target="_blank" rel="noreferrer">
                Visit Markaz Al Haqq
              </Link>
            </Button>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Join the mailing list for launch updates and early onboarding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
