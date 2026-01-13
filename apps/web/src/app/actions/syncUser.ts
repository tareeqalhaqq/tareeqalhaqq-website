'use server';

import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function syncUserToSupabase() {
  const { userId, getToken } = auth();

  if (!userId) {
    return;
  }

  const user = await clerkClient.users.getUser(userId);
  const token = await getToken();
  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const fullName = user.fullName ?? null;
  const avatarUrl = user.imageUrl ?? null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => token ?? null,
    }
  );

  await supabase.from('profiles').upsert(
    {
      clerk_id: userId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    { onConflict: 'clerk_id' },
  );
}
