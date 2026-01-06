'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { EventsManager } from '@/components/admin/events-manager';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { status, profile, isAdmin } = useAuthProfile();
  const isAuthorized = status === 'authenticated' && isAdmin;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        {status === 'loading' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-3xl font-semibold">Preparing your admin view</h1>
            <p className="text-sm text-white/70">Checking your account access…</p>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Admin access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">
              This area is reserved for administrators. Please sign in to verify your credentials.
            </p>
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        )}
        {status === 'authenticated' && !isAuthorized && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Access restricted</p>
            <h1 className="text-3xl font-semibold">Admin permissions required</h1>
            <p className="text-sm text-white/70">
              Your account does not have administrator permissions. Return to your dashboard to continue.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        )}
        {isAuthorized && (
          <>
            <div className="glass-panel space-y-3 p-8 text-white">
              <p className="eyebrow">Dashboard</p>
              <h1 className="text-3xl font-semibold">Admin overview</h1>
              <p className="text-sm text-white/70">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}. Manage the academy experience and keep
                everything running smoothly.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <a href="https://markazalhaqq.org">View academy site</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/logout">Sign out</a>
                </Button>
              </div>
            </div>
            <div className="glass-panel grid gap-4 p-6 text-white md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Members</p>
                <p className="text-lg font-semibold">Monitor enrollment</p>
                <p className="text-sm text-white/70">Track how students are engaging across lessons and resources.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Content</p>
                <p className="text-lg font-semibold">Curate learning</p>
                <p className="text-sm text-white/70">Review course material and keep your community up to date.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Account</p>
                <p className="text-lg font-semibold">Secure access</p>
                <p className="text-sm text-white/70">Manage profile details, billing preferences, and sign-in options.</p>
              </div>
            </div>
            <EventsManager adminName={profile?.full_name ?? undefined} />
          </>
        )}
      </div>
    </section>
  );
}
