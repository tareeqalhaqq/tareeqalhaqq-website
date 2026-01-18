'use client';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function useSupabase() {
  const { getToken } = useAuth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const token = await getToken({ template: 'supabase' });
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: token ? `Bearer ${token}` : '',
            },
          });
        },
      },
    },
  );

  return supabase;
}
