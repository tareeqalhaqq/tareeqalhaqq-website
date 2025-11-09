
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { upcomingEvents } from "@/lib/data";

export default function Home() {
  const nextRetreat = upcomingEvents[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden text-center">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/95" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(231, 178, 84, 0.2), transparent 65%)" }} />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-16">
            <span className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-black/50 shadow-[0_15px_40px_rgba(15,61,63,0.35)]">
              <Image
                src="/images/logo-mark.svg"
                alt="Tareeq Al Haqq crest"
                width={128}
                height={128}
                className="h-full w-full object-contain"
                priority
              />
            </span>

            <div className="space-y-4">
              <p className="eyebrow text-primary">Tareeq Al Haqq</p>
              <h1 className="text-4xl font-headline uppercase tracking-[0.15em] text-white drop-shadow-md md:text-6xl">
                Authentic Knowledge, Anywhere
              </h1>
              <p className="text-lg text-white/80 md:text-xl" style={{ fontFamily: "Amiri, serif" }}>
                Discover a neutral, research-driven platform dedicated to reliable Islamic knowledge, curated reading, verified
                athkar, and guided learning tools.
              </p>
              <p className="text-sm text-white/60 italic font-serif">
                Study at your pace, organise your insights, and stay connected to trustworthy resources.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 md:flex-row">
              <Image
                src="/images/logo-mark.svg"
                alt="Portrait of Mustafa Asif"
                width={170}
                height={170}
                className="h-36 w-36 rounded-full border border-white/20 bg-white/5 object-contain p-3 shadow-[0_18px_50px_rgba(0,0,0,0.7)]"
                priority
              />
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.4em] text-primary/70">Guided by</p>
                <p className="text-2xl font-headline text-white">Mustafa Asif</p>
                <p className="mt-1 max-w-md text-sm text-white/70">
                  Mustafa curates dependable texts, annotations, and study tracks so Tareeq Al Haqq remains a trusted companion for students and researchers alike.
                </p>
              </div>
            </div>

            {nextRetreat && (
              <div className="glass-panel w-full max-w-3xl text-left">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="eyebrow text-primary/80">Upcoming Feature Session</p>
                    <h2 className="text-2xl font-headline text-white md:text-3xl">{nextRetreat.title}</h2>
                    <div className="mt-4 flex flex-col gap-3 text-sm text-white/70 md:flex-row md:items-center">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(nextRetreat.date).toLocaleString("en-GB", { dateStyle: "long" })}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-primary/70 md:inline-block" />
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {nextRetreat.location}
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-105"
                  >
                    <Link href="#register">See Details</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="page-section">
          <div className="page-section__inner space-y-12 text-center">
            <div className="space-y-4">
              <p className="eyebrow">Platform Pillars</p>
              <h2 className="text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">Your Hub for Verified Learning</h2>
              <p className="mx-auto max-w-3xl text-base text-white/70">
                Tareeq Al Haqq is built for anyone seeking clear, referenced answers. Explore carefully sourced materials, stay organised with collaborative tools, and engage with teachers who prioritise evidence-based guidance.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[{
                title: "Referenced Resources",
                description:
                  "Browse curated books, articles, and athkar with citations to recognised scholars and publishers.",
                icon: BookOpen,
              },
              {
                title: "Smart Study Tools",
                description:
                  "Use the built-in note system, bookmarks, and AI summaries to personalise how you engage with each text.",
                icon: Sparkles,
              },
              {
                title: "Community Collaboration",
                description:
                  "Share reading lists, discuss authentic answers, and build projects with peers focused on beneficial knowledge.",
                icon: Users,
              }].map(({ title, description, icon: Icon }) => (
                <div key={title} className="glass-panel h-full text-left">
                  <Icon className="mb-6 h-10 w-10 text-primary" />
                  <h3 className="text-xl font-headline uppercase tracking-[0.2em] text-white">{title}</h3>
                  <p className="mt-3 text-sm text-white/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="register" className="page-section">
          <div className="page-section__inner grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div className="space-y-6 text-left">
              <p className="eyebrow">Platform Highlights</p>
              <h2 className="text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">Everything You Need to Study Well</h2>
              <p className="text-base text-white/70">
                Part of Tareeq Al Haqq is a powerful app featuring authenticated book collections, searchable athkar, guided fiqh overviews, AI-assisted study notes, and timely prayer schedules. More specialised tools will continue to roll out.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {["Authenticated book library", "Note-taking synced across devices", "AI support for key concepts", "Prayer times & reminders"].map((item) => (
                  <div key={item} className="glass-panel flex items-center gap-3 p-4 text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel space-y-6 text-center">
              <p className="eyebrow">Secure Your Place</p>
              <h3 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">Join the Knowledge Community</h3>
              <p className="text-sm text-white/70">
                Subscribe for early access to app betas, curated reading plans, and announcements on upcoming research initiatives.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-[1.02]"
              >
                <Link href="/contact">Join the Waiting List</Link>
              </Button>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Evidence-based • Accessible • Continually Expanding</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
