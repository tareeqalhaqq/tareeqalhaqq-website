import { redirect } from 'next/navigation';

import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const context = await requireAuth();

  if (context.isAdmin) {
    redirect('/dashboard/admin');
  }

  redirect('/dashboard/user');
}
