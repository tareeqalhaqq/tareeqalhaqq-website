import "react-native-gesture-handler";
import { useEffect, useMemo, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { clearUserRole, fetchUserRole, saveUserRole } from "@/services/profiles";
import { useAuthStore } from "@/state/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
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
    if (!ready) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [ready, router, segments, session]);

  if (!ready) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
