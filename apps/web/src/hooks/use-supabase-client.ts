'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export function useSupabaseClient() {
  const { getToken, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isSignedIn) {
      setToken(null);
      return () => {
        isMounted = false;
      };
    }

    getToken({ template: 'supabase' })
      .then((nextToken) => {
        if (isMounted) {
          setToken(nextToken ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setToken(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getToken, isSignedIn]);

  return useMemo(() => (token ? createBrowserClient(token) : null), [token]);
}
