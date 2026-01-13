'use server';

import { createClient } from '@supabase/supabase-js';
import { auth0 } from '@/lib/auth0';

export async function syncUserToSupabase() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return;
  }

  const { token } = await auth0.getAccessToken();
  const email = user.email ?? null;
  const fullName = user.name ?? null;
  const avatarUrl = user.picture ?? null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => token ?? null,
    }
  );

  await supabase.from('profiles').upsert(
    {
      clerk_id: user.sub,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    { onConflict: 'clerk_id' },
  );
}
