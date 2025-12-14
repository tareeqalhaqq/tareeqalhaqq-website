import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';

type Role = 'admin' | 'student';

export type Profile = {
  id: string;
  email: string | null;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type AuthContext = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
};

export async function getUserAndProfile(): Promise<AuthContext> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return { user: null, profile: null, isAdmin: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  return { user, profile, isAdmin: profile.role === 'admin' };
}

export async function requireAuth(): Promise<AuthContext> {
  const { user, profile } = await getUserAndProfile();

  if (!user) {
    redirect('/login');
  }

  return { user, profile, isAdmin: profile?.role === 'admin' };
}

export async function requireRole(role: Role, redirectPath: string = '/dashboard'): Promise<AuthContext> {
  const { user, profile } = await requireAuth();

  if (!profile || profile.role !== role) {
    redirect(redirectPath);
  }

  return { user, profile, isAdmin: profile.role === 'admin' };
}

export async function requireStudent(redirectPath: string = '/login'): Promise<AuthContext> {
  const { user, profile } = await requireAuth();

  if (!profile || (profile.role !== 'student' && profile.role !== 'admin')) {
    redirect(redirectPath);
  }

  return { user, profile, isAdmin: profile.role === 'admin' };
}
