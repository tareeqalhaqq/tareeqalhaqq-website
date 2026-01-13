'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useSupabase } from '@/lib/supabaseClient';

type Role = 'admin' | 'student' | 'member';

type User = {
  id: string;
  email: string | null;
};

export type Profile = {
  clerk_id: string | null;
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
  const supabase = useSupabase();
  const { user, isLoading } = useUser();
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    membership: null,
  });

  const loadProfile = async (authUser: User) => {
    if (!supabase) return;

    const [profileResult, membershipResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('clerk_id, email, app_role, full_name, avatar_url, created_at')
        .eq('clerk_id', authUser.id)
        .maybeSingle(),
      supabase
        .from('academy_memberships')
        .select('academy_role, active')
        .eq('clerk_id', authUser.id)
        .maybeSingle(),
    ]);

    setState({
      status: 'authenticated',
      user: authUser,
      profile: profileResult.data ?? null,
      membership: membershipResult.data ?? null,
    });
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user?.sub) {
      setState({ status: 'unauthenticated', user: null, profile: null, membership: null });
      return;
    }

    if (!supabase) {
      setState((prev) => ({ ...prev, status: 'loading' }));
      return;
    }

    const email = user.email ?? null;
    const fullName = user.name ?? null;
    const avatarUrl = user.picture ?? null;
    const nextUser = { id: user.sub, email };

    const ensureProfile = async () => {
      await supabase
        .from('profiles')
        .upsert(
          {
            clerk_id: user.sub,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            app_role: 'member',
          },
          { onConflict: 'clerk_id' },
        );
    };

    void (async () => {
      await ensureProfile();
      await loadProfile(nextUser);
    })();
  }, [
    isLoading,
    supabase,
    user?.email,
    user?.name,
    user?.picture,
    user?.sub,
  ]);

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
