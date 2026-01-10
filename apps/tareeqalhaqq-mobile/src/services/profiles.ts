import { supabase } from "./supabaseClient";
import { secureStore } from "./secureStore";

export type UserRole = "user" | "admin";
export type Madhab = "hanafi" | "shafii" | "maliki" | "hanbali";

export type ProfileDetails = {
  date_of_birth?: string | null;
  madhab?: Madhab | null;
};

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

export const fetchProfileDetails = async (
  userId: string
): Promise<ProfileDetails | null> => {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("date_of_birth, madhab")
    .eq("id", userId)
    .maybeSingle<ProfileDetails>();

  if (error) {
    console.warn("Unable to fetch profile details.", error.message);
    return null;
  }

  return data ?? null;
};

export const updateProfileDetails = async (
  userId: string,
  updates: ProfileDetails
) => {
  if (!userId) {
    return { error: new Error("Missing user id.") };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  return { error };
};
