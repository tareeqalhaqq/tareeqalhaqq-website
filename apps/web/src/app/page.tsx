import Link from 'next/link';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    title: 'Tarbiyyah & Tazkiyah',
    description: 'Spiritual refinement anchored in Qur’an, Sunnah, and the lived tradition of scholarship.',
  },
  {
    title: 'Scholarly Precision',
    description: 'Structured pathways that honour classical methodology while supporting modern learners.',
  },
  {
    title: 'Community & Care',
    description: 'Mentorship, pastoral support, and service projects that keep knowledge rooted in action.',
  },
];

const featureCards = [
  {
    title: 'Foundations of Faith',
    description: 'Core beliefs, creed, and devotional practice to ground every seeker.',
  },
  {
    title: 'Arabic Immersion',
    description: 'A focused track for reading, comprehension, and linguistic mastery.',
  },
  {
    title: 'Qur’anic Sciences',
    description: 'Guided access to tafsir, tajwid, and contextual study.',
  },
];

const offerings = [
  'Weekly live intensives with verified scholars',
  'Full curriculum vault with lifetime access',
  'Study companions, notes, and reading plans',
  'Private community gatherings and retreats',
];

export default function HomePage() {
  return (
    <div className="space-y-24 pb-24">
      <section className="relative overflow-hidden pt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1829]/70 via-transparent to-[#0f1829]" />
        <div className="page-section__inner relative grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="space-y-8 text-white/80">
            <p className="eyebrow">Tareeq Al Haqq</p>
            <h1 className="text-4xl font-headline text-white md:text-6xl">
              Reviving authentic Islamic knowledge for the modern seeker.
            </h1>
            <p className="text-base text-white/70 md:text-lg">
              Inspired by the Rahmaniyyah aesthetic, Tareeq Al Haqq curates immersive learning, spiritual development, and community care in a single
              hub.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
                <Link href="/signup">Join the waiting list</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 hover:border-white/60 hover:text-white"
              >
                <Link href="/about">Explore the vision</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Live Cohorts', value: '12+ yearly' },
                { label: 'Mentors', value: '30 scholars' },
                { label: 'Study Hours', value: '4,000+' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-16 top-6 hidden h-52 w-52 rounded-full bg-primary/20 blur-3xl md:block" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/5 shadow-2xl shadow-black/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,193,214,0.35),transparent_55%)]" />
              <div className="relative flex min-h-[420px] flex-col justify-end p-10">
                <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Guided by the scholars</p>
                <p className="mt-3 text-lg text-white">Authentic learning with compassionate mentorship.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="space-y-6 text-white/80">
            <p className="eyebrow">Our pillars</p>
            <h2 className="section-title">A path rooted in Qur’an and Sunnah.</h2>
            <p>
              Every pathway is designed to keep seekers grounded in verified sources, while providing the mentorship, discipline, and care that
              sustained the earliest generations.
            </p>
            <div className="space-y-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="glass-card p-5">
                  <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="text-sm text-white/70">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,193,214,0.25),transparent_60%)]" />
            <div className="relative flex min-h-[360px] flex-col justify-end p-10">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Tradition</p>
              <p className="mt-3 text-lg text-white/90">A space for devotion, scholarship, and community.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner space-y-10">
          <div className="space-y-4 text-center text-white/80">
            <p className="eyebrow">Core programmes</p>
            <h2 className="section-title">Structured learning journeys.</h2>
            <p className="mx-auto max-w-2xl text-base text-white/70">
              Each programme is curated to help students progress from foundational knowledge into mastery.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <div key={card.title} className="glass-card overflow-hidden">
                <div className="relative h-32 w-full bg-[radial-gradient(circle_at_top,rgba(110,193,214,0.3),transparent_60%)]" />
                <div className="space-y-3 p-6 text-white/80">
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-white/70">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="glass-card space-y-6 p-8 text-white/80">
            <p className="eyebrow">Learning experience</p>
            <h2 className="section-title">A complete, immersive curriculum.</h2>
            <p>
              From daily lessons to capstone intensives, each element is designed to build depth, confidence, and humility in the pursuit of
              knowledge.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {offerings.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
            <Button asChild className="w-fit rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
              <Link href="/academy">Explore the curriculum</Link>
            </Button>
          </div>
          <div className="space-y-6">
            <div className="glass-card p-6 text-white/80">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Mentorship</p>
              <h3 className="mt-3 text-2xl font-headline text-white">Personal guidance at every level.</h3>
              <p className="mt-4 text-sm text-white/70">
                Scholars, instructors, and cohort leads support students with live sessions, accountability, and spiritual counsel.
              </p>
            </div>
            <div className="glass-card p-6 text-white/80">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Community care</p>
              <h3 className="mt-3 text-2xl font-headline text-white">Healing spaces for seekers.</h3>
              <p className="mt-4 text-sm text-white/70">
                Private gatherings, retreats, and service opportunities keep learning grounded in compassion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-card grid gap-8 p-10 text-white md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-4">
              <p className="eyebrow">Stay connected</p>
              <h2 className="section-title">Get early access to the Tareeq Al Haqq academy.</h2>
              <p className="text-white/70">
                Join the waiting list to receive programme updates, launch dates, and scholarship opportunities.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 hover:border-white/60 hover:text-white"
              >
                <Link href="/signin">Member sign in</Link>
              </Button>
              <Button asChild className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
                <Link href="/signup">Join the waitlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
