import { BrainCircuit, Smartphone } from "lucide-react";

const projects = [
  {
    title: "Mutoon AI",
    description:
      "An AI-powered tool designed to help learners navigate classical Islamic texts (mutoon). Mutoon AI assists with searching, understanding, and cross-referencing primary sources so students can study traditional works more efficiently.",
    icon: BrainCircuit,
  },
  {
    title: "Mobile & Web Apps",
    description:
      "We design and develop mobile and web applications that support Islamic learning, from verified athkar and reference tools to structured study platforms. Each app is built with care for accuracy and a clean user experience.",
    icon: Smartphone,
  },
];

export default function ActiveProjectsPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner space-y-10">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Building With Purpose</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Active Projects</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            We are actively building tools that make authentic Islamic knowledge easier to access, study, and apply.
            This page is ready for you to customize as project details evolve.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <article key={project.title} className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/30">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-base font-headline uppercase tracking-[0.18em] text-white">{project.title}</h2>
                <p className="mt-2 text-sm text-white/70">{project.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
