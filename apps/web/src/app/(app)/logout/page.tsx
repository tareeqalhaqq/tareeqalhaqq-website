'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    signOut().finally(() => {
      router.replace('/sign-in');
    });
  }, [router, signOut]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold">Signing you out...</p>
    </main>
  );
}

