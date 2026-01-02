import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export async function getAuth() {
  const supabase = supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) return { user: null, profile: null };

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,app_role,created_at")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

export async function requireUser() {
  const { user, profile } = await getAuth();
  if (!user) redirect("/login");
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireUser();
  if (!profile || profile.app_role !== "admin") redirect("/not-authorized");
  return { user, profile };
}
