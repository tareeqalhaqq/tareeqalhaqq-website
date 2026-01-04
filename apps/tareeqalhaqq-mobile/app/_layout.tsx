import "react-native-gesture-handler";
import { useEffect, useMemo, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { clearUserRole, fetchUserRole, saveUserRole } from "@/services/profiles";
import { useAuthStore } from "@/state/authStore";
import { getSetupCompleted } from "@/services/setup";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const queryClient = useMemo(() => new QueryClient(), []);
  const segments = useSegments();
  const router = useRouter();
  const { session, setSession, setRole } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setReady(true);
      SplashScreen.hideAsync();
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    let active = true;

    if (!session?.user?.id) {
      setRole("user");
      clearUserRole();
      return () => {
        active = false;
      };
    }

    fetchUserRole(session.user.id).then((role) => {
      if (!active) return;
      setRole(role);
      saveUserRole(role);
    });

    return () => {
      active = false;
    };
  }, [session?.user?.id, setRole]);

  useEffect(() => {
    let active = true;
    if (!session?.user?.id) {
      setSetupComplete(null);
      return () => {
        active = false;
      };
    }
    getSetupCompleted().then((flag) => {
      if (!active) return;
      setSetupComplete(flag);
    });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    // Web SSO via postMessage from parent (main site embedding the app)
    if (typeof window === "undefined") return;
    const handler = (event: MessageEvent) => {
      const data = event.data as any;
      if (data?.type === "SUPABASE_SESSION" && data?.session?.access_token) {
        const { access_token, refresh_token } = data.session;
        supabase.auth.setSession({ access_token, refresh_token });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inSetup = segments[0] === "setup";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (session && setupComplete === false && !inSetup) {
      router.replace("/setup");
      return;
    }

    if (session && inAuthGroup) {
      router.replace("/");
      return;
    }

    if (session && setupComplete && inSetup) {
      router.replace("/");
    }
  }, [ready, router, segments, session, setupComplete]);

  if (!ready) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
