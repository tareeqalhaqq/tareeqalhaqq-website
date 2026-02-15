'use client';

import { ArrowDown, BookOpen, Compass, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/layout/footer';

const pillars = [
  {
    title: 'Knowledge',
    description:
      "Authentic knowledge rooted in the Qur'an, Sunnah, and the understanding of the righteous predecessors.",
    icon: BookOpen,
  },
  {
    title: 'Digital Infrastructure',
    description:
      'A growing digital ecosystem of structured tools, archives, and guided pathways built for beneficial learning.',
    icon: Compass,
  },
  {
    title: 'Community Impact',
    description:
      'Resources and initiatives that strengthen communities, cultivate service, and support principled growth in the Ummah.',
    icon: Users,
  },
];

const projects = [
  {
    title: 'Mutoon AI',
    description:
      'An AI-assisted study companion designed to help learners navigate foundational texts with context, structure, and clarity.',
    tag: 'Education',
    icon: Sparkles,
  },
  {
    title: 'Markaz Al-Haqq',
    description:
      'A knowledge hub connecting students to scholars, curated programs, and trusted resources grounded in authentic methodology.',
    tag: 'Institution',
    icon: BookOpen,
  },
  {
    title: 'Nur Recitations',
    description:
      'A focused platform for beautiful and accurate Qur’an recitations, helping hearts connect to revelation with reflection.',
    tag: 'Media',
    icon: Users,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: 'easeOut' },
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col pb-10">
      <div className="pointer-events-none fixed inset-0 -z-10 gradient-bg" />

      <motion.section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8" {...fadeUp}>
          <div className="space-y-6">
            <p className="eyebrow">Who We Are</p>
            <h1 className="text-4xl font-headline tracking-tight text-white md:text-6xl lg:text-7xl">
              A Clear Path to
              <span className="block text-primary">Authentic Knowledge</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
              Rooted in the Qur&apos;an, Sunnah, and the understanding of the righteous predecessors.
            </p>
          </div>

          <a
            href="#about"
            className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-primary/40 hover:text-primary/70"
          >
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <ArrowDown className="h-4 w-4" />
            </motion.div>
          </a>
        </motion.div>
      </motion.section>

      <section id="about" className="section-wrapper">
        <div className="section-inner">
          <motion.div className="mb-14 max-w-5xl" {...fadeUp}>
            <p className="eyebrow mb-4">About</p>
            <h2 className="text-4xl font-headline tracking-tight text-white md:text-6xl">
              We are authentic knowledge — Qur&apos;an, Sunnah, and the understanding of the righteous predecessors.
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ title, description, icon: Icon }, i) => (
              <motion.article
                key={title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary/70" />
                </div>
                <h3 className="mb-3 text-xl font-headline tracking-tight text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/45">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="vision" className="section-wrapper">
        <div className="section-inner grid gap-6 md:grid-cols-2">
          <motion.article
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <h3 className="mb-5 text-4xl font-headline tracking-tight text-white">Our Vision</h3>
            <p className="text-base leading-relaxed text-white/50">
              To revive clarity upon the path of truth by building a global digital ecosystem rooted in authentic Islamic
              knowledge — empowering individuals, strengthening communities, and cultivating principled leadership for
              generations to come.
            </p>
            <div className="my-7 h-px bg-white/10" />
            <p className="text-sm leading-relaxed text-white/40">
              We envision a future where sacred knowledge is structured, accessible, and preserved with excellence —
              where technology serves revelation, and institutions serve the Ummah.
            </p>
          </motion.article>

          <motion.article
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <h3 className="mb-5 text-4xl font-headline tracking-tight text-white">Our Mission</h3>
            <p className="text-base leading-relaxed text-white/50">
              To develop high-quality educational platforms, media, and digital tools that make authentic Islamic
              knowledge accessible worldwide — grounded in sincerity, scholarship, and precision.
            </p>
            <div className="my-7 h-px bg-white/10" />
            <ul className="space-y-3 text-sm text-white/45">
              <li>• Deliver structured learning rooted in Qur&apos;an and Sunnah</li>
              <li>• Build innovative Islamic digital platforms and applications</li>
              <li>• Cultivate leadership, character, and service within the Ummah</li>
            </ul>
          </motion.article>
        </div>
      </section>

      <section id="projects" className="section-wrapper">
        <div className="section-inner">
          <motion.div className="mb-12 max-w-2xl" {...fadeUp}>
            <p className="eyebrow mb-4">Projects</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">What we are building</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {projects.map(({ title, description, icon: Icon, tag }, i) => (
              <motion.article
                key={title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
              >
                <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/50">{tag}</div>
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary/70" />
                </div>
                <h3 className="mb-3 text-xl font-headline tracking-tight text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
