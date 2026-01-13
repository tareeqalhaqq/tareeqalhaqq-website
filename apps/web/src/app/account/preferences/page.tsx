'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0';

import { Button } from '@/components/ui/button';
import Profile from '@/components/Profile';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function AccountPreferencesPage() {
  const router = useRouter();
  const { status, user } = useAuthProfile();
  const { user: authUser } = useUser();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [router, status]);

  if (status === 'loading') {
    return (
      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Account settings</p>
            <h1 className="text-3xl font-semibold">Loading preferences</h1>
            <p className="text-sm text-white/70">Preparing your account settings…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Account settings</p>
          <h1 className="text-3xl font-semibold">Manage your preferences</h1>
          <p className="text-sm text-white/70">Update your sign-in details and keep your account secure.</p>
        </div>

        <div className="glass-panel space-y-6 p-8 text-white">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Signed in as <span className="text-white">{user?.email ?? authUser?.email ?? 'Unknown'}</span>
          </div>
          <Profile />
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/profile">Edit profile</Link>
            </Button>
            <Button asChild variant="ghost">
              <a href="/auth/logout">Sign out</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
