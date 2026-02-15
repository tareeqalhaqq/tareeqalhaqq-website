'use client';

import Link from "next/link";
import { Clapperboard, Globe2, Users2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";

const highlightCards = [
  {
    title: "Cinematic Production",
    description:
      "From concept to final cut, we produce documentary-grade content that captures the essence of every moment.",
    icon: Clapperboard,
  },
  {
    title: "Global Coverage",
    description:
      "Our teams operate across 25+ countries, bringing local expertise to every production with a global perspective.",
    icon: Globe2,
  },
  {
    title: "Dedicated Teams",
    description:
      "Expert shooters, editors, and directors work in concert to deliver stories that exceed expectations.",
    icon: Users2,
  },
];

const visionPoints = [
  "Deliver cinematic-quality coverage for events and organisations globally.",
  "Build lasting partnerships rooted in trust and creative excellence.",
  "Empower communities by amplifying their voices through media.",
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col pb-10">
      <div className="gradient-bg" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(62,105,255,0.22)_0%,_rgba(2,8,24,0)_55%)]" />

      <main className="relative z-10 flex-1">
        <section id="about" className="section-wrapper pt-40 md:pt-48">
          <div className="section-inner space-y-12">
            <div className="max-w-4xl space-y-7">
              <p className="eyebrow">Who we are</p>
              <h1 className="text-balance text-5xl font-semibold leading-tight text-white md:text-7xl">
                Crafting visual narratives that resonate across <span className="text-white/45">cultures and borders</span>
              </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {highlightCards.map(({ title, description, icon: Icon }) => (
                <motion.article
                  key={title}
                  className="rounded-3xl border border-white/10 bg-black/35 p-7 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                    <Icon className="h-5 w-5 text-[#8BA9FF]" />
                  </div>
                  <h2 className="mb-3 text-2xl font-semibold text-white">{title}</h2>
                  <p className="text-base leading-relaxed text-white/55">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="vision" className="section-wrapper py-32 md:py-40">
          <div className="section-inner grid gap-8 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl md:p-10">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Our Vision</h2>
              <p className="mt-6 text-lg leading-relaxed text-white/65">
                We envision a world where every significant moment is captured with care, every story told with
                integrity, and every audience moved to understanding.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl md:p-10">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Our Mission</h2>
              <ul className="mt-6 space-y-4 text-base text-white/65">
                {visionPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#4A75FF]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section-wrapper py-32 text-center md:py-44">
          <div className="section-inner max-w-3xl space-y-8">
            <h2 className="text-5xl font-semibold text-white md:text-7xl">
              Join the <span className="text-[#9FB7FF]">team</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/55">
              We&apos;re always looking for talented creators. Apply to join and work on productions that matter.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-white/90"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
