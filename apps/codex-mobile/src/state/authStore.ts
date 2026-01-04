import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { UserRole } from "@/services/profiles";

type AuthState = {
  session: Session | null;
  user: User | null;
  role: UserRole;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: "user",
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null
    }),
  setRole: (role) => set({ role })
}));
