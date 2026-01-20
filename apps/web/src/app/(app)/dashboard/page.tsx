import UserDashboardClient from './UserDashboardClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import { getServerProfile } from '@/lib/auth-server';

export default async function DashboardPage() {
  await syncUserToSupabase();

  return <UserDashboardClient />;
}
