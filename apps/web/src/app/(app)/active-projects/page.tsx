import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { fallbackProjects, projectSelectFields } from '@/lib/projects';

type ProjectView = {
  id?: string;
  title: string;
  description: string;
  tag?: string | null;
  href?: string | null;
};

async function getProjects(): Promise<ProjectView[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return fallbackProjects;
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('projects')
      .select(projectSelectFields)
      .eq('is_published', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error || !data?.length) {
      return fallbackProjects;
    }

    return data;
  } catch {
    return fallbackProjects;
  }
}

export default async function ActiveProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-10">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Building With Purpose</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Active Projects</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            This page is powered by your admin dashboard. Add, edit, and publish project cards from Admin → Projects
            Manager and they will appear here automatically.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const href = project.href || '/active-projects';
            return (
              <article
                key={`${project.id ?? project.title}-${project.title}`}
                className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                {project.tag && (
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/70">{project.tag}</p>
                )}
                <h2 className="text-base font-headline uppercase tracking-[0.18em] text-white">{project.title}</h2>
                <p className="mt-2 text-sm text-white/70">{project.description}</p>
                <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm text-primary transition hover:text-primary/80">
                  Learn more
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
