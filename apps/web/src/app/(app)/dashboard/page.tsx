import UserDashboardClient from './UserDashboardClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';

export default async function DashboardPage() {
  await syncUserToSupabase();

  return <UserDashboardClient />;
}
