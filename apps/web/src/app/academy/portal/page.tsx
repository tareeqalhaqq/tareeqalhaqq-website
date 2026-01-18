'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function AcademyPortalPage() {
  const { status, profile, isAdmin, role, error } = useAuthProfile();
  const displayName = profile?.full_name ?? profile?.display_name ?? profile?.name ?? 'Student';
  const isAuthorized = status === 'authenticated' && (role === 'student' || isAdmin);

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-8">
        {status === 'loading' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Academy Portal</p>
            <h1 className="text-3xl font-semibold">Preparing your portal</h1>
            <p className="text-sm text-white/70">Checking your account access…</p>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Student access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">
              This portal is reserved for enrolled students. Please sign in to verify your credentials.
            </p>
            <Button asChild>
              <Link href="/signin">Go to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'error' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Profile unavailable</p>
            <h1 className="text-3xl font-semibold">We couldn&apos;t load your profile</h1>
            <p className="text-sm text-white/70">{error ?? 'Please contact support to finish setting up your account.'}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
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
              <p className="eyebrow">Academy Portal</p>
              <h1 className="text-3xl font-semibold">Welcome, {displayName}</h1>
              <p className="text-sm text-white/70">
                You have student access to the Academy. Content on this route requires membership in
                <code className="ml-2">student_users</code> or admin privileges.
              </p>
            </div>
            <div className="glass-panel space-y-3 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Next steps</p>
              <p className="text-lg font-semibold">Bookmark this portal</p>
              <p className="text-sm text-white/70">
                We&apos;ll use this space to surface cohort materials and authenticated resources for active students.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
