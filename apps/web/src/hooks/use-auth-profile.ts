'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/clients';

type Role = 'admin' | 'student' | 'member';

type User = {
  id: string;
  email: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  app_role: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type AcademyMembership = {
  academy_role: string | null;
  active: boolean | null;
};

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  membership: AcademyMembership | null;
};

const deriveRole = (profile: Profile | null, membership: AcademyMembership | null): Role => {
  const isAdmin = profile?.app_role === 'admin' || membership?.academy_role === 'admin';
  if (isAdmin) return 'admin';

  const isStudent = Boolean(membership?.active) && membership?.academy_role === 'student';
  if (isStudent) return 'student';

  return profile?.app_role === 'student' ? 'student' : 'member';
};

export function useAuthProfile() {
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), []);
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    membership: null,
  });

  const loadProfile = async (user: User) => {
    if (!supabase) return;

    const [profileResult, membershipResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, app_role, full_name, avatar_url, created_at')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('academy_memberships')
        .select('academy_role, active')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    setState({
      status: 'authenticated',
      user,
      profile: profileResult.data ?? null,
      membership: membershipResult.data ?? null,
    });
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const init = async () => {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setState({ status: 'unauthenticated', user: null, profile: null, membership: null });
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
        setState({ status: 'unauthenticated', user: null, profile: null, membership: null });
        return;
      }

      loadProfile(sessionUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const role = deriveRole(state.profile, state.membership);
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  return {
    ...state,
    role,
    isAdmin,
    isStudent,
  };
}
