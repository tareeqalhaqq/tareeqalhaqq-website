import type { ReactNode } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { syncUserProfile } from '@/app/actions/syncUser';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (userId) {
    const user = await currentUser();

    if (user) {
      await syncUserProfile(user);
    }
  }

  return <>{children}</>;
}
