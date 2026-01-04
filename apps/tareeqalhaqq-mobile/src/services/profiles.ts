import { supabase } from "./supabaseClient";
import { secureStore } from "./secureStore";

export type UserRole = "user" | "admin";

const ROLE_STORAGE_KEY = "user_role";

type ProfileRoleRow = {
  app_role?: string | null;
  role?: string | null;
};

const normalizeRole = (value?: string | null): UserRole =>
  value === "admin" ? "admin" : "user";

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  if (!userId) {
    return "user";
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("app_role, role")
    .eq("id", userId)
    .maybeSingle<ProfileRoleRow>();

  if (error) {
    console.warn("Unable to fetch user role.", error.message);
    return "user";
  }

  return normalizeRole((data?.app_role ?? data?.role) ?? "user");
};

export const saveUserRole = async (role: UserRole) => {
  await secureStore.setItem(ROLE_STORAGE_KEY, role);
};

export const clearUserRole = async () => {
  await secureStore.removeItem(ROLE_STORAGE_KEY);
};
