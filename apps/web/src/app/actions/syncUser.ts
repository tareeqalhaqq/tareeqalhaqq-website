'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function syncUserToSupabase() {
  const { userId, getToken } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return;
  }

  const token = await getToken();
  const email = user.emailAddresses[0]?.emailAddress;
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
