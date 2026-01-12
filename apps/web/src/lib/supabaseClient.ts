'use client';

import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

export function useSupabase() {
  const { session } = useSession();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => session?.getToken() ?? null,
    },
  );

  return supabase;
}
