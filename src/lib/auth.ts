import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export async function getUserContext() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      isAdmin: false,
      isStudent: false,
    };
  }

  const { data: profile } = await supabase
    .from<Profile>('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: adminMembership } = await supabase
    .from<{ user_id: string }>('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: studentMembership } = await supabase
    .from<{ user_id: string }>('student_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    user,
    profile: profile ?? null,
    isAdmin: Boolean(adminMembership),
    isStudent: Boolean(studentMembership),
  };
}

export async function requireAuth() {
  const context = await getUserContext();

  if (!context.user) {
    redirect('/login');
  }

  return context;
}

export async function requireAdmin() {
  const context = await getUserContext();

  if (!context.isAdmin) {
    redirect('/dashboard');
  }

  return context;
}

export async function requireStudent() {
  const context = await getUserContext();

  if (!context.isStudent && !context.isAdmin) {
    redirect('/academy');
  }

  return context;
}
