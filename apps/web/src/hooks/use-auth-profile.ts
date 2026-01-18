'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types/auth-profile';

type Role = 'admin' | 'student' | 'member';

type User = {
  id: string;
  email: string | null;
};

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'error';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  error: string | null;
};

const normalizeRole = (role: string | null | undefined) => role?.trim().toLowerCase() ?? null;
const adminRoles = new Set(['admin', 'administrator', 'owner', 'super_admin', 'superadmin']);
const isAdminRole = (role: string | null | undefined) => {
  const normalized = normalizeRole(role);
  return normalized ? adminRoles.has(normalized) : false;
};

const getProfileRole = (profile: Profile | null) =>
  normalizeRole(profile?.app_role ?? profile?.user_role ?? profile?.role);
const getProfileEmail = (profile: Profile | null) =>
  profile?.email ?? profile?.user_email ?? profile?.email_address ?? null;

const deriveRole = (profile: Profile | null): Role | null => {
  if (!profile) {
    return null;
  }

  const profileRole = getProfileRole(profile);
  const isAdmin = isAdminRole(profileRole);
  if (isAdmin) return 'admin';

  if (profileRole === 'student') {
    return 'student';
  }

  return profileRole ?? 'member';
};

export function useAuthProfile() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const supabase = useSupabase();
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    error: null,
  });
  const activeUserRef = useRef<string | null>(null);

  const loadProfile = async (id: string) => {
    setState({
      status: 'loading',
      user: { id, email: null },
      profile: null,
      error: null,
    });

    const profileResult = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', id)
      .maybeSingle();

    if (profileResult.error) {
      setState({
        status: 'error',
        user: { id, email: null },
        profile: null,
        error: 'We could not load your profile details. Please try again.',
      });
      return;
    }

    const profile = profileResult.data ?? null;

    if (!profile) {
      setState({
        status: 'error',
        user: { id, email: null },
        profile: null,
        error: 'No profile was found for this account. Please contact support so we can finish setup.',
      });
      return;
    }

    setState({
      status: 'authenticated',
      user: {
        id,
        email: getProfileEmail(profile),
      },
      profile,
      error: null,
    });
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      activeUserRef.current = null;
      setState({ status: 'unauthenticated', user: null, profile: null, error: null });
      return;
    }

    if (activeUserRef.current !== userId) {
      activeUserRef.current = userId;
    }

    void (async () => {
      await loadProfile(userId);
    })();
  }, [
    isLoaded,
    isSignedIn,
    supabase,
    userId,
  ]);

  const role = deriveRole(state.profile);
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  return {
    ...state,
    role,
    isAdmin,
    isStudent,
  };
}
