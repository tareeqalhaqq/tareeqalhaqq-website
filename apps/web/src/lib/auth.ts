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

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        app_role: "member",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      return {
        success: false,
        error: "Signup created, but we could not finish your profile. Please contact support.",
      };
    }
  }

  return { success: true, user: data.user };
}
