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
  id: string;
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

const deriveRole = (profile: Profile | null, membership: AcademyMembership | null): Role => {
  const profileRole = normalizeRole(profile?.app_role);
  const membershipRole = normalizeRole(membership?.academy_role);
  const isAdmin = isAdminRole(profileRole) || isAdminRole(membershipRole);
  if (isAdmin) return 'admin';

  const isStudent = Boolean(membership?.active) && membershipRole === 'student';
  if (isStudent) return 'student';

  return profileRole === 'student' ? 'student' : 'member';
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

    const profileResult = await supabase
      .from('profiles')
      .select('id, clerk_id, email, app_role, full_name, avatar_url, created_at')
      .eq('clerk_id', user.id)
      .maybeSingle();

    let profile = profileResult.data ?? null;

    if (!profile && user.email) {
      const emailProfileResult = await supabase
        .from('profiles')
        .select('id, clerk_id, email, app_role, full_name, avatar_url, created_at')
        .eq('email', user.email)
        .maybeSingle();
      profile = emailProfileResult.data ?? null;

      if (profile && !profile.clerk_id) {
        await supabase.from('profiles').update({ clerk_id: user.id }).eq('id', profile.id);
        profile = { ...profile, clerk_id: user.id };
      }
    }

    const membershipFilter = profile?.id ? `clerk_id.eq.${user.id},user_id.eq.${profile.id}` : `clerk_id.eq.${user.id}`;
    const membershipResult = await supabase
      .from('academy_memberships')
      .select('academy_role, active')
      .or(membershipFilter)
      .maybeSingle();

    setState({
      status: 'authenticated',
      user,
      profile,
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

    const ensureProfile = async () => {
      const existingProfileByClerk = await supabase
        .from('profiles')
        .select('id, app_role, clerk_id')
        .eq('clerk_id', userId)
        .maybeSingle();

      const existingProfileByEmail =
        !existingProfileByClerk.data && email
          ? await supabase
              .from('profiles')
              .select('id, app_role, clerk_id')
              .eq('email', email)
              .maybeSingle()
          : null;

      const existingProfile = existingProfileByClerk.data ? existingProfileByClerk : existingProfileByEmail;
      const existingRole = existingProfile?.data?.app_role;
      const appRole = normalizeRole(existingRole) ?? 'member';

      if (existingProfile?.data?.id && !existingProfile.data.clerk_id) {
        await supabase
          .from('profiles')
          .update({
            clerk_id: userId,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            app_role: appRole,
          })
          .eq('id', existingProfile.data.id);
      } else {
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
      }
    };

    void (async () => {
      await ensureProfile();
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
