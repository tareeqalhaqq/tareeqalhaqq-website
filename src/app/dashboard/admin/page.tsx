import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth';

export default async function AdminDashboardPage() {
  const { profile, user } = await requireAdmin();
  const displayName = profile?.full_name ?? user?.email ?? 'Admin';

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-8">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Admin</p>
          <h1 className="text-3xl font-semibold">Welcome back, {displayName}.</h1>
          <p className="text-sm text-white/70">
            You have administrator access. Use the quick links below to review members and manage the academy.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/dashboard/user">View user view</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/academy/portal">Academy portal</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/logout">Sign out</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Membership</p>
            <p className="text-lg font-semibold">Admin membership confirmed</p>
            <p className="text-sm text-white/70">
              This account is registered in <code>admin_users</code>. Access to protected admin routes is enforced server-side.
            </p>
          </div>
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Profiles</p>
            <p className="text-lg font-semibold">Manage member records</p>
            <p className="text-sm text-white/70">
              Review profile rows and keep key contact information up to date across admin and student tables.
            </p>
          </div>
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Sessions</p>
            <p className="text-lg font-semibold">Log out securely</p>
            <p className="text-sm text-white/70">
              Signing out clears the session cookies refreshed through the Supabase server client.
            </p>
            <Button asChild variant="destructive" className="w-full">
              <Link href="/logout">Log out</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
