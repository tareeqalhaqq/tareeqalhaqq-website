import { requireStudent } from '@/lib/auth';

export default async function AcademyPortalPage() {
  const { profile, user } = await requireStudent();
  const displayName = profile?.full_name ?? user?.email ?? 'Student';

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-8">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Academy Portal</p>
          <h1 className="text-3xl font-semibold">Welcome, {displayName}</h1>
          <p className="text-sm text-white/70">
            You have student access to the Academy. Content on this route requires membership in <code>student_users</code>
            or admin privileges.
          </p>
        </div>
        <div className="glass-panel space-y-3 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-white/60">Next steps</p>
          <p className="text-lg font-semibold">Bookmark this portal</p>
          <p className="text-sm text-white/70">
            We&apos;ll use this space to surface cohort materials and authenticated resources for active students.
          </p>
        </div>
      </div>
    </section>
  );
}
