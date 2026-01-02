import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { secureStore } from "./secureStore";

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn("Missing Supabase environment variables.");
}

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: secureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
