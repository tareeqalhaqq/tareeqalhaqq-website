'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { useClerkConfig } from '@/components/providers/clerk-config-provider';
import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function AcademyPortalPage() {
  const { status, profile, user, isAdmin, role } = useAuthProfile();
  const { isClerkConfigured } = useClerkConfig();
  const displayName = profile?.full_name ?? user?.email ?? 'Student';
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
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="glass-panel space-y-3 p-8 text-white">
              <p className="eyebrow">Student access required</p>
              <h1 className="text-3xl font-semibold">Sign in to continue</h1>
              <p className="text-sm text-white/70">
                This portal is reserved for enrolled students. Sign in with your account to verify your
                membership and open your student dashboard.
              </p>
            </div>
            <div className="glass-panel p-6 text-white">
              {isClerkConfigured ? (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <Image
                      src="/images/logo1.png"
                      alt="Tareeq Al Haqq"
                      width={40}
                      height={40}
                      className="rounded-xl object-contain"
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                      Academy Login
                    </p>
                  </div>
                  <SignIn
                    appearance={clerkAuthAppearance}
                    path="/academy/portal"
                    routing="path"
                    afterSignInUrl="/academy/portal"
                    signUpUrl="/signup"
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/70">Authentication is not configured in this environment.</p>
                  <Button asChild>
                    <Link href="/">Return home</Link>
                  </Button>
                </div>
              )}
            </div>
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
