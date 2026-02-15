'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export const dynamic = 'force-dynamic';

export default function AccountPreferencesPage() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const router = useRouter();

  if (!isClerkConfigured) {
    return (
      <section className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-3 text-white">
          <h1 className="text-3xl font-semibold">Account settings unavailable</h1>
          <p className="text-sm text-white/70">Authentication is not configured for this environment.</p>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </section>
    );
  }

  const { status, user } = useAuthProfile();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  if (status === 'loading') {
    return (
      <section className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="space-y-3 text-white">
            <p className="eyebrow">Account settings</p>
            <h1 className="text-3xl font-semibold">Loading preferences</h1>
            <p className="text-sm text-white/70">Preparing your account settings…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-white">
        <div className="space-y-3">
          <p className="eyebrow">Account settings</p>
          <h1 className="text-3xl font-semibold">Manage your preferences</h1>
          <p className="text-sm text-white/70">Update your sign-in details and keep your account secure.</p>
        </div>

        <div className="rounded-3xl border border-white/10 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 text-sm text-white/70">
            <span>
              Signed in as <span className="text-white">{user?.email ?? 'Unknown'}</span>
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full',
                card: 'bg-transparent shadow-none border-none p-0',
                navbar: 'hidden',
                pageScrollBox: 'p-0',
                profileSection: 'rounded-2xl border border-white/10 bg-transparent p-4 sm:p-6',
                profileSectionTitle: 'text-white',
                profileSectionPrimaryButton: 'bg-white text-slate-900',
                profileSectionPrimaryButtonArrow: 'text-slate-900',
              },
            }}
            routing="path"
            path="/account/preferences"
          />
          <div className="flex flex-wrap gap-3 pt-6">
            <Button asChild variant="outline">
              <Link href="/profile">Edit profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
