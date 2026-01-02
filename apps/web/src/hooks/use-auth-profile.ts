'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/clients';

type Role = 'admin' | 'student';

type User = {
  id: string;
  email: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
};

export function useAuthProfile() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
  });

  const loadProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, avatar_url, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      setState({ status: 'authenticated', user, profile: null });
      return;
    }

    setState({ status: 'authenticated', user, profile: data });
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setState({ status: 'unauthenticated', user: null, profile: null });
        return;
      }

      await loadProfile(user);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      if (!sessionUser) {
        setState({ status: 'unauthenticated', user: null, profile: null });
        return;
      }

      loadProfile(sessionUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    ...state,
    isAdmin: state.profile?.role === 'admin',
  };
}
