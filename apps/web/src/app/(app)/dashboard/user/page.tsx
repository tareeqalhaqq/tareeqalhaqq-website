'use client';

import { UserDashboardView } from '@/components/dashboard/dashboard-views';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function UserDashboardPage() {
  const auth = useAuthProfile();
  return <UserDashboardView auth={auth} />;
}

