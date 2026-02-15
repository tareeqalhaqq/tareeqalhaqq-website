'use client';

import { BrainCircuit, Landmark, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";

/* ── Animation variants ── */
const projects = [
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

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col pb-10">
      <div className="gradient-bg" />

      {/* ── Hero ── */}
      <motion.section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8"
        >
          <motion.div className="space-y-6">
            <motion.p
              className="eyebrow"
            >
              Tareeq Al Haqq
            </motion.p>
            <h1 className="text-4xl font-headline tracking-tight text-white md:text-6xl lg:text-7xl">
              A Clear Path to
              <motion.span
                className="block text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 14 }}
              >
                Authentic Knowledge
              </motion.span>
            </h1>
            <motion.p
              className="mx-auto max-w-xl text-base leading-relaxed text-white/50 md:text-lg"
            >
              Curating dependable resources, structured learning, and simple
              tools so you can focus on understanding.
            </motion.p>
          </motion.div>

          <motion.div
            transition={{ delay: 0.6 }}
          >
            <a
              href="#about"
              className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/30 transition-colors hover:border-primary/40 hover:text-primary/70"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown className="h-4 w-4" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── About ── */}
      <section id="about" className="section-wrapper">
        <motion.div
          className="section-inner"
        >
          <motion.div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">About</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              Built for focused study
            </h2>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div className="space-y-6">
              <p className="text-base leading-relaxed text-white/50">
                Tareeq Al Haqq is a platform dedicated to making authentic
                Islamic knowledge accessible with clarity, context, and
                trustworthy sourcing. Founded by Mustafa Asif, the initiative
                pairs verified scholarship with modern technology.
              </p>
              <p className="text-base leading-relaxed text-white/50">
                We curate dependable references, commentary, and learning tools
                so anyone can study the faith with confidence. The team combines
                traditional scholarship with thoughtful software to keep
                resources organised and accessible.
              </p>
            </motion.div>

            <motion.div className="space-y-4">
              {[
                {
                  label: "Our History",
                  text: "Founded to address scattered and unverified resources, the platform began by curating trusted libraries and structuring teacher-approved study plans.",
                },
                {
                  label: "Our Mission",
                  text: "We verify sources, design intuitive study tools, and connect learners with specialists so authentic guidance is easy to access and apply.",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* ── Vision ── */}
      <section id="vision" className="section-wrapper">
        <motion.div
          className="section-inner"
        >
          <motion.div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">Vision</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              Where we are headed
            </h2>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div className="space-y-6">
              <p className="text-base leading-relaxed text-white/50">
                We are building a global reference point for credible Islamic
                learning, pairing timeless scholarship with responsible
                technology.
              </p>
              <p className="text-base leading-relaxed text-white/50">
                The Academy will extend the platform with structured courses,
                guided readings, and collaborative cohorts built around
                authenticated sources. Combining live instruction,
                scholar-vetted materials, and consistent mentorship.
              </p>
            </motion.div>

            <motion.div className="space-y-4">
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
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs text-white/40"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-white/30">
                Directed by Mustafa Asif in partnership with Markaz Al Haqq,
                working alongside qualified scholars to ensure every learning
                track stays anchored to authentic sources.
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
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto w-full max-w-5xl px-6">
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* ── Projects ── */}
      <section id="projects" className="section-wrapper">
        <motion.div
          className="section-inner"
        >
          <motion.div className="mb-16 max-w-2xl">
            <p className="eyebrow mb-4">Projects</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              What we are building
            </h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/55">
              We&apos;re always looking for talented creators. Apply to join and work on productions that matter.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map(({ title, description, icon: Icon, tag }) => (
              <motion.article
                key={title}
                className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/50">
                  {tag}
                </div>
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
