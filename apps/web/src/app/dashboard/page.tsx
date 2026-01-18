import DashboardRouterClient from '@/app/dashboard/DashboardRouterClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';

export default async function DashboardRouter() {
  await syncUserToSupabase();

  return <DashboardRouterClient />;
}
