'use server';

import type { User } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function syncUserProfile(user: User) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role configuration.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const email = user.emailAddresses[0]?.emailAddress;

  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_id: user.id,
      email,
      full_name: user.fullName,
    },
    { onConflict: 'clerk_id' },
  );

  if (error) {
    console.error('SUPABASE PROFILE SYNC FAILED:', error);
    throw error;
  }
}
