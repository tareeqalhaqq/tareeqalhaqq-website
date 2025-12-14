import { redirect } from 'next/navigation';

import { requireAuth } from '@/lib/auth';

export default async function DashboardRouter() {
  const { profile } = await requireAuth();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'admin') {
    redirect('/dashboard/admin');
  }

  if (profile.role === 'student') {
    redirect('/dashboard/student');
  }

  redirect('/login');
}
