'use client';

import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function StudentDashboardPage() {
  const { status, profile, role } = useAuthProfile();
  const isAuthorized = status === 'authenticated' && role === 'student';

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        {status === 'loading' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-3xl font-semibold">Preparing your student view</h1>
            <p className="text-sm text-white/70">Checking your account access…</p>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Student access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">
              This area is reserved for enrolled students. Please sign in to verify your credentials.
            </p>
            <Button asChild>
              <Link href="/signin">Go to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'authenticated' && !isAuthorized && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Access restricted</p>
            <h1 className="text-3xl font-semibold">Student permissions required</h1>
            <p className="text-sm text-white/70">
              Your account does not have student access. Return to your dashboard to continue.
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
              <h1 className="text-3xl font-semibold">Student home</h1>
              <p className="text-sm text-white/70">
                {profile?.full_name ? `Glad to have you back, ${profile.full_name}. ` : ''}Jump into your lessons, keep
                track of progress, and stay connected with the academy.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <a href="https://markazalhaqq.org">Continue learning</a>
                </Button>
                <SignOutButton>
                  <Button variant="outline">Sign out</Button>
                </SignOutButton>
              </div>
            </div>
            <div className="glass-panel grid gap-4 p-6 text-white md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Courses</p>
                <p className="text-lg font-semibold">Pick up where you left off</p>
                <p className="text-sm text-white/70">Resume your latest lesson and keep your streak alive.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Resources</p>
                <p className="text-lg font-semibold">Explore the library</p>
                <p className="text-sm text-white/70">Download guides and watch recordings to reinforce learning.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Account</p>
                <p className="text-lg font-semibold">Manage your profile</p>
                <p className="text-sm text-white/70">Update your details and adjust notification preferences.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
