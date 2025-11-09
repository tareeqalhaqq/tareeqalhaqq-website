import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-24 text-center">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
            <span className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-lg">
              <Image
                src="/images/logo1.png"
                alt="Tareeq Al Haqq crest"
                width={120}
                height={120}
                className="h-full w-full object-contain"
                priority
              />
            </span>
            <div className="space-y-5">
              <p className="eyebrow text-primary">Tareeq Al Haqq</p>
              <h1 className="text-4xl font-headline uppercase tracking-[0.12em] text-white md:text-5xl">
                A Clear Path to Authentic Knowledge
              </h1>
              <p className="mx-auto max-w-2xl text-base text-white/80 md:text-lg">
                Study with assurance. Our platform curates dependable resources, structured learning tracks, and simple tools so you can focus on understanding, not searching.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg shadow-black/30 transition hover:shadow-xl"
              >
                <Link href="/contact">Join the Community</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10"
              >
                <Link href="/about">Explore Our Mission</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section__inner grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-6 text-left">
              <p className="eyebrow">Why Learners Trust Us</p>
              <h2 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">Built for calm, focused study</h2>
              <p className="text-base text-white/75">
                Every feature is designed to reduce noise. Browse verified references, organise insights, and revisit essential concepts with ease.
              </p>
              <div className="space-y-4">
                {["Curated classical and contemporary works", "Inline references for quick verification", "Workspace that keeps notes and highlights together"].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel flex flex-col items-center gap-4 text-center">
              <Image
                src="/images/logo1.png"
                alt="Illustration of the Tareeq Al Haqq workspace"
                width={260}
                height={260}
                className="h-48 w-48 object-contain"
              />
              <p className="text-sm text-white/70">
                A single, quiet space for readings, annotations, and reflections.
              </p>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section__inner space-y-10 text-center">
            <div className="space-y-4">
              <p className="eyebrow">Key Pillars</p>
              <h2 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">Everything you need, nothing you don't</h2>
              <p className="mx-auto max-w-2xl text-base text-white/75">
                These essentials keep the experience light while covering what matters for your learning journey.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[{
                title: "Verified Resources",
                description: "Hand-checked books, articles, and athkar with clear sourcing.",
                icon: BookOpen,
              },
              {
                title: "Guided Focus",
                description: "Study plans and reminders that stay out of your way.",
                icon: Sparkles,
              },
              {
                title: "Supportive Network",
                description: "Mentors and peers invested in authentic knowledge.",
                icon: Users,
              }].map(({ title, description, icon: Icon }) => (
                <div key={title} className="glass-panel h-full space-y-4 text-left">
                  <Icon className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-headline uppercase tracking-[0.18em] text-white">{title}</h3>
                  <p className="text-sm text-white/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
