'use client';

import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function useSupabase() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase environment variables.');
    }

    return createClient(
      supabaseUrl!,
      supabaseKey!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const token = await getToken({ template: 'supabase' });
            const headers = new Headers(options.headers);

            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            } else {
              headers.delete('Authorization');
            }

            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      },
    );
  }, [getToken]);

  return supabase;
}
