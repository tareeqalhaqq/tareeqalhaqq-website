import { supabase } from "./supabaseClient";
import { secureStore } from "./secureStore";

export type UserRole = "user" | "admin";

const ROLE_STORAGE_KEY = "user_role";

export const fetchUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("Unable to fetch user role.", error.message);
    return "user" as UserRole;
  }

  return (data?.role ?? "user") as UserRole;
};

export const saveUserRole = async (role: UserRole) => {
  await secureStore.setItem(ROLE_STORAGE_KEY, role);
};

export const clearUserRole = async () => {
  await secureStore.removeItem(ROLE_STORAGE_KEY);
};
