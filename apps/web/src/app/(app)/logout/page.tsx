'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function LogoutPage() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const router = useRouter();

  if (!isClerkConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Authentication is not configured.</p>
      </main>
    );
  }

  const { signOut } = useClerk();

  useEffect(() => {
    signOut().finally(() => {
      router.replace('/');
    });
  }, [router, signOut]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold">Signing you out...</p>
    </main>
  );
}
