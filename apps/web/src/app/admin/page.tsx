'use server';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export default async function AdminPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, app_role, role')
    .eq('id', session!.user.id)
    .maybeSingle();

  const role = profile?.app_role ?? profile?.role ?? 'user';
  if (role !== 'admin') {
    redirect('/mobile');
  }

  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-6xl space-y-10">
        <div className="glass-panel space-y-3 p-8">
          <p className="eyebrow">Admin</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Tareeq Al Haqq Admin Console
          </h1>
          <p className="text-white/70">
            Manage content and platform settings. Some controls are restricted until
            workflows are finalized.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AdminCard
            title="Books & Resources"
            description="Add, update, or retire library assets."
            status="Coming soon"
          />
          <AdminCard
            title="Events"
            description="Create events, update status, and manage registrations."
            status="Coming soon"
          />
          <AdminCard
            title="Athkar"
            description="Curate, reorder, and edit athkar entries."
            status="Coming soon"
          />
          <AdminCard
            title="Site Content"
            description="Edit site info and metadata for the platform."
            status="Coming soon"
          />
        </div>

        <div className="glass-panel space-y-4 p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Academy</p>
              <h2 className="text-xl font-semibold text-white">Markaz Al Haqq Academy</h2>
              <p className="text-sm text-white/70">
                Redirect to the academy program to manage cohorts and learning tracks.
              </p>
            </div>
            <Link
              href="https://markazalhaqq.org"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-md"
            >
              Go to Academy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="glass-panel space-y-3 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
          {status}
        </span>
      </div>
      <p className="text-sm text-white/70">{description}</p>
      <button
        className="cursor-not-allowed rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white/60"
        disabled
      >
        Restricted for now
      </button>
    </div>
  );
}
