import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export type Role = 'admin' | 'student' | 'member';

export async function getServerProfile() {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, role: null, profile: null, isAdmin: false };
  }

  const supabase = await createSupabaseClient();

  // Optimization: Fetch profile first. 
  // If app_role is admin, we don't need to check memberships for admin status (though we might need it for student status).
  // But since 99% of page loads for admins just need to pass assertAdmin, we can prioritize.

  // However, for parallel fetching performance, Promise.all is usually good. 
  // The 'forever' hang suggests one of these tables is blocked by RLS.
  // Since we fixed profiles, let's assume academy_memberships is the blocker if it lacks a SELECT policy.

  // Let's optimize by handling the possibility of RLS failure gracefully or just fetching profile first if meaningful.
  // Actually, better: if the user JUST authenticated, Clerk might be fast, but Supabase might be cold.

  const [profileResult, membershipResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('app_role, full_name, email')
      .eq('clerk_id', userId)
      .maybeSingle(),
    supabase
      .from('academy_memberships')
      .select('academy_role, active')
      .eq('clerk_id', userId)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  // If membership RLS fails (returns error due to policy), treating it as null is safer than hanging/crashing.
  // The .maybeSingle() usually handles 0 rows, but RLS error might be different.
  const membership = membershipResult.data; // .error is available if needed

  const isAdmin = profile?.app_role === 'admin' || membership?.academy_role === 'admin';

  let role: Role = 'member';
  if (isAdmin) {
    role = 'admin';
  } else if (membership?.active && membership?.academy_role === 'student') {
    role = 'student';
  } else if (profile?.app_role === 'student') {
    role = 'student';
  }

  return { userId, role, profile, isAdmin };
}

export const assertAdmin = async () => {
  const { userId, isAdmin } = await getServerProfile();
  const supabase = await createSupabaseClient();

  if (!userId) {
    return { supabase, userId: null, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!isAdmin) {
    return { supabase, userId, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase, userId, errorResponse: null };
};
