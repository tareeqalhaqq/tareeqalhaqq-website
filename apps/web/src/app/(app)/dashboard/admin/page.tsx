import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import { getServerProfile } from '@/lib/auth-server';

export default async function AdminDashboardPage() {
  await syncUserToSupabase();
  const { userId, isAdmin, profile } = await getServerProfile();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <AdminDashboardClient profile={profile} />;
}
