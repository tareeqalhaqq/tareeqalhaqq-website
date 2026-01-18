'use server';

import { createSupabaseClient } from '@/lib/supabase';
import type { AcademyMembership, Profile } from '@/types/auth-profile';

export type AuthProfileResult = {
  profile: Profile | null;
  membership: AcademyMembership | null;
};

export async function fetchAuthProfileByClerkId(clerkId: string): Promise<AuthProfileResult> {
  const supabase = await createSupabaseClient();

  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (profileResult.error) {
    console.error('Supabase profile fetch failed:', profileResult.error);
  }

  const profile = profileResult.data ?? null;
  const membershipFilter = profile?.id
    ? `clerk_id.eq.${clerkId},user_id.eq.${profile.id}`
    : `clerk_id.eq.${clerkId}`;

  const membershipResult = await supabase
    .from('academy_memberships')
    .select('*')
    .or(membershipFilter)
    .maybeSingle();

  if (membershipResult.error) {
    console.error('Supabase membership fetch failed:', membershipResult.error);
  }

  return {
    profile,
    membership: membershipResult.data ?? null,
  };
}
