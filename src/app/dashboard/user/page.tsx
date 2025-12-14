import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/auth';

export default async function UserDashboardPage() {
  const { profile, user, isAdmin } = await requireAuth();
  const displayName = profile?.full_name ?? user?.email ?? 'there';

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-8">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Dashboard</p>
          <h1 className="text-3xl font-semibold">Welcome, {displayName}!</h1>
          <p className="text-sm text-white/70">
            You&apos;re signed in to your Tareeq Al Haqq account. Use the quick links below to manage your profile,
            handle billing details, or sign out securely.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/billing">Billing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/preferences">Account Settings</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="ghost">
                <Link href="/dashboard/admin">Admin view</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Profile</p>
            <p className="text-lg font-semibold">Keep your details current</p>
            <p className="text-sm text-white/70">
              Update your name, preferred email, and contact details to stay connected with community updates.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">Edit profile</Link>
            </Button>
          </div>
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Billing</p>
            <p className="text-lg font-semibold">Manage your plan</p>
            <p className="text-sm text-white/70">
              View invoices, update payment methods, and adjust your subscription when you need.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/billing">Open billing</Link>
            </Button>
          </div>
          <div className="glass-panel flex flex-col gap-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Session</p>
            <p className="text-lg font-semibold">Sign out securely</p>
            <p className="text-sm text-white/70">
              Done for now? Log out to keep your account secure and pick up where you left off later.
            </p>
            <div className="mt-auto">
              <Button asChild variant="destructive" className="w-full">
                <Link href="/logout">Log out</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
