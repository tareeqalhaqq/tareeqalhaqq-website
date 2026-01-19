'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AdminDashboardView, StudentDashboardView, UserDashboardView } from '@/components/dashboard/dashboard-views';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function DashboardRouterClient() {
  const router = useRouter();
  const auth = useAuthProfile();

  useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace('/sign-in');
    }
  }, [auth.status, router]);

  if (auth.isAdmin) {
    return <AdminDashboardView auth={auth} />;
  }

  if (auth.role === 'student') {
    return <StudentDashboardView auth={auth} />;
  }

  return <UserDashboardView auth={auth} />;
}

