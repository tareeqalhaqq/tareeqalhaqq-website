'use client';

import { useMemo } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function useSupabase(): SupabaseClient | null {
  const { getToken } = useAuth();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (input, init) => {
          const token = await getToken({ template: 'supabase' }).catch(() => null);
          const headers = new Headers(init?.headers ?? {});
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return fetch(input, { ...init, headers });
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }, [getToken, supabaseAnonKey, supabaseUrl]);
}
