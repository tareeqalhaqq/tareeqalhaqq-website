'use client';

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const features = [
  {
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
  },
];

const trustPoints = [
  "Curated classical and contemporary works",
  "Inline references for quick verification",
  "Workspace that keeps notes and highlights together",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <motion.section
          className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-24 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8"
            variants={staggerContainer}
          >
            <motion.span
              className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-lg"
              variants={fadeUp}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              whileHover={{ rotate: 3 }}
            >
              <Image
                src="/images/logo1.png"
                alt="Tareeq Al Haqq crest"
                width={120}
                height={120}
                className="h-full w-full object-contain"
                priority
              />
              <motion.span
                className="absolute inset-0 rounded-3xl bg-primary/10"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.span>
            <motion.div className="space-y-5" variants={fadeUp}>
              <p className="eyebrow text-primary">Tareeq Al Haqq</p>
              <h1 className="text-4xl font-headline uppercase tracking-[0.12em] text-white md:text-5xl">
                A Clear Path to Authentic Knowledge
              </h1>
              <p className="mx-auto max-w-2xl text-base text-white/80 md:text-lg">
                Study with assurance. Our platform curates dependable resources, structured learning tracks, and simple tools so you can focus on understanding, not searching.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center gap-4 sm:flex-row"
              variants={fadeUp}
            >
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg shadow-black/30 transition"
                >
                  <Link href="/contact">Join the Community</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <Link href="/about">Explore Our Mission</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/10"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.section>

        <section className="page-section">
          <motion.div
            className="page-section__inner grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={staggerContainer}
          >
            <motion.div className="space-y-6 text-left" variants={fadeUp}>
              <p className="eyebrow">Why Learners Trust Us</p>
              <h2 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">Built for calm, focused study</h2>
              <p className="text-base text-white/75">
                Every feature is designed to reduce noise. Browse verified references, organise insights, and revisit essential concepts with ease.
              </p>
              <div className="space-y-4">
                {trustPoints.map((item) => (
                  <motion.div
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/80"
                    variants={fadeUp}
                    transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="glass-panel flex flex-col items-center gap-4 text-center"
              variants={fadeUp}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              whileHover={{ y: -6 }}
            >
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
            </motion.div>
          </motion.div>
        </section>

        <section className="page-section">
          <motion.div
            className="page-section__inner space-y-10 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div className="space-y-4" variants={fadeUp}>
              <p className="eyebrow">Key Pillars</p>
              <h2 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">Everything you need, nothing you don't</h2>
              <p className="mx-auto max-w-2xl text-base text-white/75">
                These essentials keep the experience light while covering what matters for your learning journey.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }, index) => (
                <motion.div
                  key={title}
                  className="glass-panel h-full space-y-4 text-left"
                  variants={fadeUp}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 120, damping: 16 }}
                  whileHover={{ y: -8, boxShadow: "0 24px 45px -20px rgba(15, 118, 110, 0.5)" }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 + index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-headline uppercase tracking-[0.18em] text-white">{title}</h3>
                  <p className="text-sm text-white/70">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
