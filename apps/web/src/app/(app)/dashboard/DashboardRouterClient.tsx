'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function DashboardRouterClient() {
  const router = useRouter();
  const { status, role, isAdmin } = useAuthProfile();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
      return;
    }

    if (status === 'authenticated') {
      if (isAdmin) {
        router.replace('/dashboard/admin');
        return;
      }

      if (role === 'student') {
        router.replace('/dashboard/student');
        return;
      }

      router.replace('/dashboard/user');
    }
  }, [isAdmin, role, router, status]);

  return (
    <section className="page-section">
      <div className="page-section__inner">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Dashboard</p>
          <h1 className="text-2xl font-semibold">Loading your dashboard</h1>
          <p className="text-sm text-white/70">
            We&apos;re preparing the best view for your account. If you&apos;re not signed in, you&apos;ll be redirected to
            the sign-in screen.
          </p>
        </div>
      </div>
    </section>
  );
}

