
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
                backgroundImage: "url('https://storage.googleapis.com/static.invertase.io/assets/rahmaniyyah/rahmaniyyah-bg.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/95" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(231, 178, 84, 0.2), transparent 65%)" }} />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-16">
            <Image
              src="https://storage.googleapis.com/static.invertase.io/assets/rahmaniyyah/logo.png"
              alt="Tareeq Al Haqq crest"
              width={140}
              height={140}
              className="h-28 w-28 drop-shadow-[0_15px_40px_rgba(231,178,84,0.45)]"
              priority
            />

            <div className="space-y-4">
              <p className="eyebrow text-primary">Rahmaniyyah Institute</p>
              <h1 className="text-4xl font-headline uppercase tracking-[0.15em] text-white drop-shadow-md md:text-6xl">
                The Path to Knowledge
              </h1>
              <p className="text-lg text-white/80 md:text-xl" style={{ fontFamily: "Amiri, serif" }}>
                وَيُزَكِّيهِمْ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ
              </p>
              <p className="text-sm text-white/60 italic font-serif">
                “He purifies them and teaches them the Book and wisdom”
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 md:flex-row">
              <Image
                src="https://storage.googleapis.com/static.invertase.io/assets/rahmaniyyah/ustadh.png"
                alt="Ustadh Abdulrahman Hassan"
                width={170}
                height={170}
                className="h-36 w-36 rounded-full border border-white/20 bg-white/5 object-cover shadow-[0_18px_50px_rgba(0,0,0,0.7)]"
              />
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.4em] text-primary/70">Led by</p>
                <p className="text-2xl font-headline text-white">Ustadh Abdulrahman Hassan</p>
                <p className="mt-1 max-w-md text-sm text-white/70">
                  A sacred curriculum reviving the classical sciences of Ihsan, tailored for seekers who desire to anchor their hearts in remembrance.
                </p>
              </div>
            </div>

            {nextRetreat && (
              <div className="glass-panel w-full max-w-3xl text-left">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="eyebrow text-primary/80">Upcoming Intensive</p>
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
                    <Link href="#register">Reserve Seat</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="page-section">
          <div className="page-section__inner space-y-12 text-center">
            <div className="space-y-4">
              <p className="eyebrow">Our Tradition</p>
              <h2 className="text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">A Sanctuary for Hearts and Minds</h2>
              <p className="mx-auto max-w-3xl text-base text-white/70">
                Inspired by Rahmaniyyah, we nurture seekers through a timeless blend of sacred knowledge, devotional practice, and community service.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[{
                title: "Classical Scholarship",
                description:
                  "Structured study circles reconnecting seekers with classical texts and the living chain of transmission.",
                icon: BookOpen,
              },
              {
                title: "Spiritual Tarbiyah",
                description:
                  "Guided dhikr gatherings and spiritual mentorship cultivating sincerity, humility, and steadfast hearts.",
                icon: Sparkles,
              },
              {
                title: "Community of Service",
                description:
                  "A global family unified in khidmah, uplifting the ummah through outreach, mercy, and meaningful action.",
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
              <p className="eyebrow">Retreat Highlights</p>
              <h2 className="text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">Immerse Yourself in a Living Legacy</h2>
              <p className="text-base text-white/70">
                Over nine nights, delve into tafsir, sirah, and purification of the heart alongside immersive dhikr circles. Experience the grace of companionship and the discipline of sacred knowledge in an atmosphere crafted to mirror Rahmaniyyah&apos;s spiritual elegance.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {["Daily durus & dhikr", "Mentorship circles", "Community iftar", "Dedicated sisters programme"].map((item) => (
                  <div key={item} className="glass-panel flex items-center gap-3 p-4 text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel space-y-6 text-center">
              <p className="eyebrow">Secure Your Place</p>
              <h3 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">Limited Seats Available</h3>
              <p className="text-sm text-white/70">
                Registration includes course materials, evening refreshments, and access to post-event recordings.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-[1.02]"
              >
                <Link href="/contact">Join the Waiting List</Link>
              </Button>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Rahmaniyyah Inspired • London • 2025</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
