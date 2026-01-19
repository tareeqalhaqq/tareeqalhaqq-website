'use client';

import { StudentDashboardView } from '@/components/dashboard/dashboard-views';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function StudentDashboardPage() {
  const auth = useAuthProfile();
  return <StudentDashboardView auth={auth} />;
}

