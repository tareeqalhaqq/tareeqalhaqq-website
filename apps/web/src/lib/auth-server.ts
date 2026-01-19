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
  const membership = membershipResult.data;

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
