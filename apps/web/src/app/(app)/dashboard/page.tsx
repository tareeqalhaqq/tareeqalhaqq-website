import { redirect } from 'next/navigation';
import UserDashboardClient from './UserDashboardClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import { getServerProfile } from '@/lib/auth-server';

export default async function DashboardPage() {
  // 1. Sync user data (fire and forget to not block UI)
  void syncUserToSupabase();

  // 2. Check role server-side
  const { isAdmin } = await getServerProfile();

  // 3. Immediate redirect if admin
  if (isAdmin) {
    redirect('/dashboard/admin');
  }

  return <UserDashboardClient />;
}
