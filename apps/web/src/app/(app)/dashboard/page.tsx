import { redirect } from 'next/navigation';
import UserDashboardClient from './UserDashboardClient';
import { getServerProfile } from '@/lib/auth-server';

export default async function DashboardPage() {
  const { userId, isAdmin } = await getServerProfile();

  if (!userId) {
    redirect('/login');
  }

  if (isAdmin) {
    redirect('/dashboard/admin');
  }

  return <UserDashboardClient />;
}
