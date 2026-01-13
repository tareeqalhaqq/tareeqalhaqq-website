import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createSupabaseClient() {
  const { getToken } = auth();
  const accessToken = await getToken();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => accessToken ?? null,
    }
  );
}

export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
