import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function createSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(
    supabaseUrl,
    supabaseKey,
    token
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      : {},
  );
}
