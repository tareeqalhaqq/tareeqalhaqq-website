'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
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
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
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
        .select('clerk_id, email, app_role, full_name, avatar_url, created_at')
        .eq('clerk_id', user.id)
        .maybeSingle(),
      supabase
        .from('academy_memberships')
        .select('academy_role, active')
        .eq('clerk_id', user.id)
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
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      setState({ status: 'unauthenticated', user: null, profile: null, membership: null });
      return;
    }

    if (!supabase) {
      setState((prev) => ({ ...prev, status: 'loading' }));
      return;
    }

    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
    const fullName = clerkUser?.fullName ?? null;
    const avatarUrl = clerkUser?.imageUrl ?? null;
    const nextUser = { id: userId, email };

    // We rely on the server-side syncUser action to create the profile.
    // Client-side upsert is removed to prevent RLS 403 errors and redundancy.

    void (async () => {
      await loadProfile(nextUser);
    })();
  }, [
    clerkUser?.primaryEmailAddress?.emailAddress,
    clerkUser?.fullName,
    clerkUser?.imageUrl,
    isLoaded,
    isSignedIn,
    supabase,
    userId,
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
