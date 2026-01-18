import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabaseAdmin";

export async function syncUserProfile() {
  console.log("SERVICE ROLE PRESENT:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  const user = await currentUser();
  if (!user) return null;

  const clerkId = user.id;
  const email = user.emailAddresses[0]?.emailAddress ?? null;
  const fullName = user.fullName ?? null;
  const avatarUrl = user.imageUrl ?? null;

  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert({
      clerk_id: clerkId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      app_role: "user"
    })
    .select()
    .single();

  if (error) {
    console.error("PROFILE INSERT FAILED:", error);
    throw new Error("Profile creation failed");
  }

  return data;
}
