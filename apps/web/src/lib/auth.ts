import { supabase } from "./supabaseClient";

export async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}
