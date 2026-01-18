'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSupabase } from '@/lib/supabaseClient';

type Role = 'admin' | 'student' | 'member';
type ClerkRole = Role | null;

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

const normalizeRole = (role: string | null | undefined) => role?.trim().toLowerCase() ?? null;
const adminRoles = new Set(['admin', 'administrator', 'owner', 'super_admin', 'superadmin']);
const isAdminRole = (role: string | null | undefined) => {
  const normalized = normalizeRole(role);
  return normalized ? adminRoles.has(normalized) : false;
};

const deriveRole = (profile: Profile | null, membership: AcademyMembership | null, clerkRole: ClerkRole): Role => {
  const profileRole = normalizeRole(profile?.app_role);
  const membershipRole = normalizeRole(membership?.academy_role);
  const normalizedClerkRole = normalizeRole(clerkRole);
  const isAdmin = isAdminRole(profileRole) || isAdminRole(membershipRole) || isAdminRole(normalizedClerkRole);
  if (isAdmin) return 'admin';

  const isStudent = Boolean(membership?.active) && membershipRole === 'student';
  if (isStudent) return 'student';

  return profileRole === 'student' || normalizedClerkRole === 'student' ? 'student' : 'member';
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

  const loadProfile = async (user: User, clerkRole: ClerkRole) => {
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

    const clerkRole = normalizeRole(clerkUser?.publicMetadata?.role as string | undefined)
      ?? normalizeRole(clerkUser?.publicMetadata?.app_role as string | undefined)
      ?? normalizeRole(clerkUser?.unsafeMetadata?.role as string | undefined)
      ?? normalizeRole(clerkUser?.unsafeMetadata?.app_role as string | undefined);

    const ensureProfile = async () => {
      const existingProfile = await supabase
        .from('profiles')
        .select('app_role')
        .eq('clerk_id', userId)
        .maybeSingle();
      const existingRole = existingProfile.data?.app_role;
      const appRole =
        isAdminRole(clerkRole) || isAdminRole(existingRole) ? 'admin' : normalizeRole(existingRole) ?? 'member';

      await supabase
        .from('profiles')
        .upsert(
          {
            clerk_id: userId,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            app_role: appRole,
          },
          { onConflict: 'clerk_id' },
        );
    };

    void (async () => {
      await ensureProfile();
      await loadProfile(nextUser, clerkRole);
    })();
  }, [
    clerkUser?.primaryEmailAddress?.emailAddress,
    clerkUser?.fullName,
    clerkUser?.imageUrl,
    clerkUser?.publicMetadata,
    clerkUser?.unsafeMetadata,
    isLoaded,
    isSignedIn,
    supabase,
    userId,
  ]);

  const clerkRole = normalizeRole(clerkUser?.publicMetadata?.role as string | undefined)
    ?? normalizeRole(clerkUser?.publicMetadata?.app_role as string | undefined)
    ?? normalizeRole(clerkUser?.unsafeMetadata?.role as string | undefined)
    ?? normalizeRole(clerkUser?.unsafeMetadata?.app_role as string | undefined);
  const role = deriveRole(state.profile, state.membership, clerkRole);
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  return {
    ...state,
    role,
    isAdmin,
    isStudent,
  };
}
