'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAuthProfileByClerkId } from '@/app/actions/fetchAuthProfile';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import type { AcademyMembership, Profile } from '@/types/auth-profile';

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

  return profileRole ?? 'member';
};

export function useAuthProfile() {
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
    const fetchProfile = async () => fetchAuthProfileByClerkId(id);
    let profileResult = await fetchProfile();
    let profile = profileResult.profile ?? null;

    if (!profile && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      try {
        await syncUserToSupabase();
      } catch (error) {
        console.error('Supabase profile sync failed:', error);
      }

      profileResult = await fetchProfile();
      profile = profileResult.profile ?? null;
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

    setState({
      status: 'authenticated',
      user: {
        id,
        email: getProfileEmail(profile),
      },
      profile,
      membership: profileResult.membership ?? null,
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

    void (async () => {
      await loadProfile(userId);
    })();
  }, [
    isLoaded,
    isSignedIn,
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
