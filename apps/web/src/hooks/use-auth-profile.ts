'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabase } from '@/lib/supabaseClient';
import { syncUserToSupabase } from '@/app/actions/syncUser';

type Role = 'admin' | 'student' | 'member';

type User = {
  id: string;
  email: string | null;
};

export type Profile = {
  id: string;
  clerk_id: string | null;
  email: string | null;
  user_email?: string | null;
  email_address?: string | null;
  app_role?: string | null;
  user_role?: string | null;
  role?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

type AcademyMembership = {
  academy_role?: string | null;
  role?: string | null;
  active: boolean | null;
};

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'error';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  membership: AcademyMembership | null;
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
const getMembershipRole = (membership: AcademyMembership | null) =>
  normalizeRole(membership?.academy_role ?? membership?.role);
const getProfileEmail = (profile: Profile | null) =>
  profile?.email ?? profile?.user_email ?? profile?.email_address ?? null;

const deriveRole = (profile: Profile | null, membership: AcademyMembership | null): Role | null => {
  if (!profile) {
    return null;
  }

  const profileRole = getProfileRole(profile);
  const membershipRole = getMembershipRole(membership);
  const isAdmin = isAdminRole(profileRole) || isAdminRole(membershipRole);
  if (isAdmin) return 'admin';

  const isStudent = Boolean(membership?.active) && membershipRole === 'student';
  if (isStudent) return 'student';

  if (profileRole === 'student') {
    return 'student';
  }

  return profileRole ?? null;
};

export function useAuthProfile() {
  const supabase = useSupabase();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    membership: null,
    error: null,
  });
  const syncAttemptedRef = useRef(false);
  const activeUserRef = useRef<string | null>(null);

  const loadProfile = async (id: string) => {
    if (!supabase) return;

    const fetchProfile = async () =>
      supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', id)
        .maybeSingle();

    const profileResult = await fetchProfile();

    if (profileResult.error) {
      console.error('Supabase profile fetch failed:', profileResult.error);
    }

    let profile = profileResult.data ?? null;

    if (!profile && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      try {
        await syncUserToSupabase();
      } catch (error) {
        console.error('Supabase profile sync failed:', error);
      }

      const retryResult = await fetchProfile();
      if (retryResult.error) {
        console.error('Supabase profile retry failed:', retryResult.error);
      }
      profile = retryResult.data ?? null;
    }

    if (!profile) {
      setState({
        status: 'error',
        user: { id, email: null },
        profile: null,
        membership: null,
        error: 'No profile was found for this account. Please contact support so we can finish setup.',
      });
      return;
    }

    const membershipFilter = profile?.id ? `clerk_id.eq.${id},user_id.eq.${profile.id}` : `clerk_id.eq.${id}`;
    const membershipResult = await supabase
      .from('academy_memberships')
      .select('*')
      .or(membershipFilter)
      .maybeSingle();

    if (membershipResult.error) {
      console.error('Supabase membership fetch failed:', membershipResult.error);
    }

    setState({
      status: 'authenticated',
      user: {
        id,
        email: getProfileEmail(profile),
      },
      profile,
      membership: membershipResult.data ?? null,
      error: null,
    });
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      syncAttemptedRef.current = false;
      activeUserRef.current = null;
      setState({ status: 'unauthenticated', user: null, profile: null, membership: null, error: null });
      return;
    }

    if (activeUserRef.current !== userId) {
      activeUserRef.current = userId;
      syncAttemptedRef.current = false;
    }

    if (!supabase) {
      setState((prev) => ({ ...prev, status: 'loading', error: null }));
      return;
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
