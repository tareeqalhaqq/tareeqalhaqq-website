'use client';

import { AdminDashboardView } from '@/components/dashboard/dashboard-views';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function AdminDashboardPage() {
  const auth = useAuthProfile();
  return <AdminDashboardView auth={auth} />;
}

