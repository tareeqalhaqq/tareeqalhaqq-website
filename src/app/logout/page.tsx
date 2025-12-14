"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { createClient } from '@/utils/supabase/clients';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.signOut().finally(() => {
      router.replace('/signin');
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold">Signing you out...</p>
    </main>
  );
}
