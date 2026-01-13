import { createClient } from '@supabase/supabase-js';
import { auth0 } from '@/lib/auth0';

export async function createSupabaseClient() {
  const session = await auth0.getSession();
  const accessToken = session ? await auth0.getAccessToken() : { token: null };

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => accessToken.token ?? null,
    }
  );
}
