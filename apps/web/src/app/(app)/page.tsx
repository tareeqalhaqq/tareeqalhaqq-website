'use client';

import Image from "next/image";
import { BrainCircuit, Smartphone, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const projects = [
  {
    title: "Mutoon AI",
    description:
      "An AI-powered tool to help learners navigate, search, and cross-reference classical Islamic texts. Study traditional works more efficiently with intelligent assistance.",
    icon: BrainCircuit,
  },
  {
    title: "Mobile & Web Apps",
    description:
      "Purpose-built applications supporting Islamic learning — from verified athkar and reference tools to structured study platforms. Built with care for accuracy and clarity.",
    icon: Smartphone,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <motion.section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8"
          variants={stagger}
        >
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <Image
              src="/images/logo1.png"
              alt="Tareeq Al Haqq crest"
              width={80}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </motion.div>

          <motion.div className="space-y-6" variants={fadeUp}>
            <p className="eyebrow">Tareeq Al Haqq</p>
            <h1 className="text-4xl font-headline tracking-tight text-white md:text-6xl lg:text-7xl">
              A Clear Path to
              <span className="block text-primary">Authentic Knowledge</span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
              Curating dependable resources, structured learning, and simple tools so you can focus on understanding.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <a
              href="#about"
              className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-white/20 hover:text-white/60"
            >
              <ArrowDown className="h-4 w-4" />
            </a>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── About ── */}
      <section id="about" className="section-wrapper">
        <motion.div
          className="section-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div className="mb-16 max-w-2xl" variants={fadeUp}>
            <p className="eyebrow mb-4">About</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              Built for focused study
            </h2>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div className="space-y-6" variants={fadeUp}>
              <p className="text-base leading-relaxed text-white/50">
                Tareeq Al Haqq is a platform dedicated to making authentic Islamic knowledge accessible with clarity, context, and trustworthy sourcing. Founded by Mustafa Asif, the initiative pairs verified scholarship with modern technology.
              </p>
              <p className="text-base leading-relaxed text-white/50">
                We curate dependable references, commentary, and learning tools so anyone can study the faith with confidence. The team combines traditional scholarship with thoughtful software to keep resources organised and accessible.
              </p>
            </motion.div>

            <motion.div className="space-y-4" variants={fadeUp}>
              {[
                { label: "Our History", text: "Founded to address scattered and unverified resources, the platform began by curating trusted libraries and structuring teacher-approved study plans." },
                { label: "Our Mission", text: "We verify sources, design intuitive study tools, and connect learners with specialists so authentic guidance is easy to access and apply." },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-white/80">
                    {item.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/40">
                    {item.text}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ── Vision ── */}
      <section id="vision" className="section-wrapper">
        <motion.div
          className="section-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div className="mb-16 max-w-2xl" variants={fadeUp}>
            <p className="eyebrow mb-4">Vision</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              Where we are headed
            </h2>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div className="space-y-6" variants={fadeUp}>
              <p className="text-base leading-relaxed text-white/50">
                We are building a global reference point for credible Islamic learning, pairing timeless scholarship with responsible technology.
              </p>
              <p className="text-base leading-relaxed text-white/50">
                The Academy will extend the platform with structured courses, guided readings, and collaborative cohorts built around authenticated sources. Combining live instruction, scholar-vetted materials, and consistent mentorship.
              </p>
            </motion.div>

            <motion.div className="space-y-4" variants={fadeUp}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-white/80">
                  Academy — Launching 2026
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Structured study paths",
                    "Verified reading packs",
                    "Live seminars",
                    "Mentor-led circles",
                    "Interactive assessments",
                    "Shared annotations",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs text-white/40"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-white/30">
                Directed by Mustafa Asif in partnership with Markaz Al Haqq, working alongside qualified scholars to ensure every learning track stays anchored to authentic sources.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ── Projects ── */}
      <section id="projects" className="section-wrapper">
        <motion.div
          className="section-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div className="mb-16 max-w-2xl" variants={fadeUp}>
            <p className="eyebrow mb-4">Projects</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              What we are building
            </h2>
            <p className="mt-4 text-base text-white/40">
              Tools that make authentic Islamic knowledge easier to access, study, and apply.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map(({ title, description, icon: Icon }) => (
              <motion.article
                key={title}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
                variants={fadeUp}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary/70" />
                </div>
                <h3 className="mb-3 text-lg font-headline tracking-tight text-white">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-white/40">
                  {description}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
