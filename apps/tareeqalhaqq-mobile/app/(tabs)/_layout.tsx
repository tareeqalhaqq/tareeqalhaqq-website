import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { Tabs } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchUserRole } from "@/services/profiles";
import { useAuthStore } from "@/state/authStore";
import { theme } from "@/theme/theme";

const getIcon = (name: string, focused: boolean) => {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: focused ? "home" : "home-outline",
    library: focused ? "book" : "book-outline",
    admin: focused ? "shield-checkmark" : "shield-checkmark-outline",
    profile: focused ? "person-circle" : "person-circle-outline"
  };
  return map[name] ?? "ellipse-outline";
};

export default function TabsLayout() {
  const { user, role: cachedRole, setRole } = useAuthStore();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 900;

  const { data: role } = useQuery({
    queryKey: ["role", user?.id],
    queryFn: () => fetchUserRole(user?.id ?? ""),
    enabled: !!user?.id,
    onSuccess: (value) => setRole(value),
    onError: () => setRole("user")
  });

  const effectiveRole = role ?? cachedRole;
  const isAdmin = effectiveRole === "admin";

  const tabBarStyle = useMemo(() => {
    if (isDesktop) {
      return {
        position: "absolute" as const,
        left: 16,
        top: 16,
        bottom: 16,
        width: 220,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radii.lg,
        alignSelf: "flex-start",
        gap: 8,
        shadowOpacity: 0.15,
        shadowRadius: 18
      };
    }
    return {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      borderTopWidth: 1,
      elevation: 12,
      height: 72,
      paddingTop: 8,
      paddingBottom: 14
    };
  }, [isDesktop]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontWeight: "700",
          letterSpacing: 0.4,
          fontSize: 12,
          textAlign: isDesktop ? "left" : "center",
          width: "100%"
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={getIcon(route.name, focused)} size={size} color={color} />
        ),
        tabBarItemStyle: isDesktop
          ? {
              alignItems: "flex-start",
              flexDirection: "row",
              columnGap: 8,
              paddingVertical: 8
            }
          : undefined,
        tabBarStyle,
        sceneContainerStyle: isDesktop
          ? { paddingLeft: 248, paddingTop: 16, paddingRight: 16 }
          : undefined
      })}
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
