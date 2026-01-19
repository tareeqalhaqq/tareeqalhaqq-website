import { redirect } from 'next/navigation';
import UserDashboardClient from './UserDashboardClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import { getServerProfile } from '@/lib/auth-server';

export default async function DashboardPage() {
  // 1. Sync user data (non-blocking if it fails, as we handled errors inside)
  await syncUserToSupabase();

  // 2. Check role server-side
  const { isAdmin } = await getServerProfile();

  // 3. Immediate redirect if admin
  if (isAdmin) {
    redirect('/dashboard/admin');
  }

  return <UserDashboardClient />;
}
