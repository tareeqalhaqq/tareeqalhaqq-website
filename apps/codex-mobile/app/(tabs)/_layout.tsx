import { Tabs } from "expo-router";
import { theme } from "@/theme/theme";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="collection" options={{ title: "Collection" }} />
      <Tabs.Screen name="athkar" options={{ title: "Athkar" }} />
      <Tabs.Screen name="notes" options={{ title: "Notes" }} />
    </Tabs>
  );
}
