"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Compass, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";
import { fallbackProjects } from "@/lib/projects";

const pillars = [
  {
    title: "Knowledge",
    description:
      "Authentic knowledge rooted in the Qur'an, Sunnah, and the understanding of the righteous predecessors.",
    icon: BookOpen,
  },
  {
    title: "Digital Infrastructure",
    description:
      "A growing digital ecosystem of structured tools, archives, and guided pathways built for beneficial learning.",
    icon: Compass,
  },
  {
    title: "Community Impact",
    description:
      "Resources and initiatives that strengthen communities, cultivate service, and support principled growth in the Ummah.",
    icon: Users,
  },
];

type ProjectPreview = {
  id?: string;
  title: string;
  description: string;
  tag?: string | null;
};

const iconByTag: Record<string, typeof Sparkles> = {
  education: Sparkles,
  institution: BookOpen,
  media: Users,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: "easeOut" },
};

export default function Home() {
  const [projects, setProjects] = useState<ProjectPreview[]>(fallbackProjects);

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as {
          projects?: ProjectPreview[];
        } | null;
        if (!active || !response.ok || !payload?.projects?.length) return;
        setProjects(payload.projects);
      } catch {
        // Keep fallback cards when the API is unavailable.
      }
    };

    loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const projectCards = useMemo(() => projects.slice(0, 3), [projects]);

  return (
    <div className="relative flex min-h-screen flex-col pb-10">
      <div className="pointer-events-none fixed inset-0 -z-10 gradient-bg" />

      <motion.section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8"
          {...fadeUp}
        >
          <div className="space-y-6">
            <p className="eyebrow text-primary">Begin Your Journey</p>
            <h1 className="mx-auto max-w-3xl text-5xl font-headline tracking-tight text-white sm:text-6xl md:text-7xl">
              Authentic Knowledge
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Tareeq Al Haqq is rooted in the Qur&apos;an and Sunnah, with
              structured pathways that help you build beneficial knowledge step
              by step.
            </p>
          </div>
        </motion.div>
      </motion.section>

      <section id="about" className="section-wrapper">
        <div className="section-inner">
          <motion.div className="mb-14 max-w-5xl" {...fadeUp}>
            <p className="eyebrow mb-4">About</p>
            <h2 className="text-4xl font-headline tracking-tight text-white md:text-6xl">
              We are authentic knowledge — Qur&apos;an, Sunnah, and the
              understanding of the righteous predecessors.
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
                transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary/70" />
                </div>
                <h3 className="mb-3 text-xl font-headline tracking-tight text-white">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-white/45">
                  {description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="vision" className="section-wrapper pt-32">
        <div className="section-inner grid gap-6 md:grid-cols-2">
          <motion.article
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <h3 className="mb-5 text-4xl font-headline tracking-tight text-white">
              Our Vision
            </h3>
            <p className="text-base leading-relaxed text-white/50">
              To revive clarity upon the path of truth by building a global
              digital ecosystem rooted in authentic Islamic knowledge —
              empowering individuals, strengthening communities, and cultivating
              principled leadership for generations to come.
            </p>
            <div className="my-7 h-px bg-white/10" />
            <p className="text-sm leading-relaxed text-white/40">
              We envision a future where sacred knowledge is structured,
              accessible, and preserved with excellence — where technology
              serves revelation, and institutions serve the Ummah.
            </p>
          </motion.article>

          <motion.article
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <h3 className="mb-5 text-4xl font-headline tracking-tight text-white">
              Our Mission
            </h3>
            <p className="text-base leading-relaxed text-white/50">
              To develop high-quality educational platforms, media, and digital
              tools that make authentic Islamic knowledge accessible worldwide —
              grounded in sincerity, scholarship, and precision.
            </p>
            <div className="my-7 h-px bg-white/10" />
            <ul className="space-y-3 text-sm text-white/45">
              <li>
                • Deliver structured learning rooted in Qur&apos;an and Sunnah
              </li>
              <li>
                • Build innovative Islamic digital platforms and applications
              </li>
              <li>
                • Cultivate leadership, character, and service within the Ummah
              </li>
            </ul>
          </motion.article>
        </div>
      </section>

      <section id="projects" className="section-wrapper pt-32">
        <div className="section-inner">
          <motion.div className="mb-12 max-w-2xl" {...fadeUp}>
            <p className="eyebrow mb-4">Projects</p>
            <h2 className="text-3xl tracking-tight text-white md:text-4xl">
              What we are building
            </h2>
            <p className="mt-4 text-sm text-white/60">
              Live updates from the admin dashboard appear here automatically.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {projectCards.map(({ id, title, description, tag }, i) => {
              const Icon = iconByTag[(tag ?? "").toLowerCase()] ?? Sparkles;
              return (
                <motion.article
                  key={`${id ?? title}-${title}`}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/50">
                    {tag}
                  </div>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary/70" />
                  </div>
                  <h3 className="mb-3 text-xl font-headline tracking-tight text-white">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/40">
                    {description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
