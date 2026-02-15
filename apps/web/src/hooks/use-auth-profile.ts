'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useClerkConfig } from '@/components/providers/clerk-config-provider';
import { resolveRoleFromMetadata, type Role } from '@/lib/roles';

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
  role: Role | null;
};

export function useAuthProfile() {
  const { isClerkConfigured } = useClerkConfig();

  if (!isClerkConfigured) {
    return {
      status: 'unauthenticated' as const,
      user: null,
      profile: null,
      membership: null,
      role: 'member' as const,
      isAdmin: false,
      isStudent: false,
    };
  }

  const { isLoaded, isSignedIn, sessionClaims, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    membership: null,
    role: null,
  });
  const clerkRole = resolveRoleFromMetadata(
    clerkUser?.publicMetadata as Record<string, unknown> | null,
    clerkUser?.unsafeMetadata as Record<string, unknown> | null,
    sessionClaims?.publicMetadata as Record<string, unknown> | null,
    sessionClaims?.unsafeMetadata as Record<string, unknown> | null,
  );

  const loadProfile = async (user: User, fallbackRole: Role | null) => {
    try {
      const response = await fetch('/api/profile', { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        profile: Profile | null;
        membership: AcademyMembership | null;
        role: Role | null;
      };

      setState({
        status: 'authenticated',
        user,
        profile: data.profile ?? null,
        membership: data.membership ?? null,
        role: data.role ?? fallbackRole ?? null,
      });
    } catch (error) {
      console.error('Failed to load profile from API:', error);
      setState({
        status: 'authenticated',
        user,
        profile: null,
        membership: null,
        role: fallbackRole ?? null,
      });
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      setState({ status: 'unauthenticated', user: null, profile: null, membership: null, role: null });
      return;
    }

    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
    const nextUser = { id: userId, email };

    // We rely on the server-side syncUser action to create the profile.
    // Client-side upsert is removed to prevent RLS 403 errors because standard users cannot freely UPSERT into profiles.

    void (async () => {
      await loadProfile(nextUser, clerkRole);
    })();
  }, [
    clerkUser?.primaryEmailAddress?.emailAddress,
    isLoaded,
    isSignedIn,
    userId,
    clerkRole,
  ]);

  const role = state.role ?? clerkRole ?? 'member';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  return {
    ...state,
    role,
    isAdmin,
    isStudent,
  };
}
