'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function syncUserToSupabase() {
  const { userId, getToken } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    console.log('No user, skipping sync');
    return;
  }

  const token = await getToken({ template: 'supabase' });

  if (!token) {
    console.error('No Clerk token generated');
    return;
  }

  const email = user.emailAddresses[0]?.emailAddress;
  const fullName = user.fullName ?? null;
  const avatarUrl = user.imageUrl ?? null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_id: userId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    { onConflict: 'clerk_id' },
  );

  if (error) {
    console.error('SUPABASE SYNC FAILED:', error);
    throw error;
  }

  console.log('Supabase sync successful for', userId);
}
