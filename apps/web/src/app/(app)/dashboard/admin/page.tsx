export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';
import { getServerProfile } from '@/lib/auth-server';

export default async function AdminDashboardPage() {
  const { userId, isAdmin, profile } = await getServerProfile();

  if (!userId) {
    redirect('/login');
  }

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <AdminDashboardClient profile={profile} />;
}
