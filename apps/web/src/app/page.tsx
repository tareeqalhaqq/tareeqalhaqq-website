import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { upcomingEvents } from '@/lib/data';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((image) => image.id === 'hero');
  const welcomeImage = PlaceHolderImages.find((image) => image.id === 'welcome');

  return (
    <div className="space-y-24 pb-20">
      <section className="page-section pt-12">
        <div className="page-section__inner grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="eyebrow">Tareeq Al Haqq</p>
            <h1 className="text-4xl font-headline uppercase tracking-[0.18em] text-white md:text-5xl">
              A trusted gateway to authentic Islamic knowledge
            </h1>
            <p className="text-base text-white/70 md:text-lg">
              Explore curated resources, academy updates, and community events designed to keep seekers grounded in verified scholarship.
              Login is only needed for member tools and dashboards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
                <Link href="/about">Explore our mission</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 hover:border-white/40 hover:text-white"
              >
                <Link href="/events">View upcoming events</Link>
              </Button>
            </div>
          </div>
          {heroImage && (
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                width={960}
                height={720}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Curated by Mustafa Asif</p>
                <p className="text-sm text-white/80">Knowledge, context, and verified sources in one home.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          {welcomeImage && (
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/30">
              <Image
                src={welcomeImage.imageUrl}
                alt={welcomeImage.description}
                data-ai-hint={welcomeImage.imageHint}
                width={960}
                height={720}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}
          <div className="glass-panel space-y-6 p-8 text-white/80">
            <p className="eyebrow">What we offer</p>
            <h2 className="text-3xl font-headline uppercase tracking-[0.18em] text-white">A modern, scholar-led experience</h2>
            <p>
              Tareeq Al Haqq blends timeless scholarship with intelligent tools. Our team curates verified references, structured learning paths,
              and guided events so you can grow with clarity.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Verified study references',
                'Guided academy cohorts',
                'Event alerts and updates',
                'Mobile-first learning tools',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
            <Button asChild className="w-fit rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
              <Link href="/academy">Learn about the academy</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner space-y-10">
          <div className="space-y-4 text-center">
            <p className="eyebrow">Community</p>
            <h2 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Upcoming gatherings</h2>
            <p className="mx-auto max-w-2xl text-base text-white/70">
              Join seminars and workshops curated for researchers, students, and community builders. Login is only required for member-only access.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="glass-panel overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={event.image.imageUrl}
                    alt={event.image.description}
                    data-ai-hint={event.image.imageHint}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
                <div className="space-y-3 p-6 text-white/80">
                  <h3 className="text-lg font-headline uppercase tracking-[0.18em] text-white">{event.title}</h3>
                  <p className="text-sm text-white/70">{event.description}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{event.location}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild className="rounded-full bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
              <Link href="/events">See all events</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-panel grid gap-8 p-10 text-white md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-4">
              <p className="eyebrow">Stay connected</p>
              <h2 className="text-3xl font-headline uppercase tracking-[0.18em] text-white">
                Access member tools when you need them
              </h2>
              <p className="text-white/70">
                Public resources stay open while member-only tools remain protected. Sign in when you need dashboards, portals, or personalised study
                flows.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 hover:border-white/40 hover:text-white"
              >
                <Link href="/signin">Member sign in</Link>
              </Button>
              <Button asChild className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
