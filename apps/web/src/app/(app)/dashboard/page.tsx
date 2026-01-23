import { redirect } from 'next/navigation';
import UserDashboardClient from './UserDashboardClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import { getServerProfile } from '@/lib/auth-server';

export default async function DashboardPage() {
  await syncUserToSupabase();
  const { userId, isAdmin } = await getServerProfile();

  if (!userId) {
    redirect('/sign-in');
  }

  if (isAdmin) {
    redirect('/dashboard/admin');
  }

  return <UserDashboardClient />;
}
