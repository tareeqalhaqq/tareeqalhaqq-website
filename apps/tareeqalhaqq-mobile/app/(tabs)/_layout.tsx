import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { theme } from "@/theme/theme";

const getIcon = (name: string, focused: boolean) => {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: focused ? "home" : "home-outline",
    library: focused ? "book" : "book-outline",
    profile: focused ? "person-circle" : "person-circle-outline"
  };
  return map[name] ?? "ellipse-outline";
};

export default function TabsLayout() {
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
          textAlign: "center",
          width: "100%"
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={getIcon(route.name, focused)} size={size} color={color} />
        ),
        tabBarStyle: {
          backgroundColor:
            Platform.OS === "ios"
              ? "rgba(13, 18, 24, 0.85)"
              : theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          height: 72,
          paddingTop: 8,
          paddingBottom: 14
        },
        sceneContainerStyle: {
          backgroundColor: theme.colors.background
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
