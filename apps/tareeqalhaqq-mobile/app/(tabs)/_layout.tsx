import { Tabs } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchUserRole } from "@/services/profiles";
import { useAuthStore } from "@/state/authStore";
import { theme } from "@/theme/theme";

export default function TabsLayout() {
  const { user, role: cachedRole, setRole } = useAuthStore();

  const { data: role } = useQuery({
    queryKey: ["role", user?.id],
    queryFn: () => fetchUserRole(user?.id ?? ""),
    enabled: !!user?.id,
    onSuccess: (value) => setRole(value),
    onError: () => setRole("user")
  });

  const effectiveRole = role ?? cachedRole;
  const isAdmin = effectiveRole === "admin";

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontWeight: "700",
          letterSpacing: 0.4,
          fontSize: 12
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 12,
          height: 72,
          paddingTop: 8,
          paddingBottom: 14
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      {isAdmin ? (
        <Tabs.Screen name="admin" options={{ title: "Admin" }} />
      ) : null}
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
