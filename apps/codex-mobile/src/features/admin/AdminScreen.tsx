import { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { ListItem } from "@/components/ListItem";
import { fetchUserRole } from "@/services/profiles";
import { fetchBooks } from "@/services/books";
import { fetchAthkarCategories } from "@/services/athkar";
import { useAuthStore } from "@/state/authStore";
import { theme } from "@/theme/theme";

export const AdminScreen = () => {
  const router = useRouter();
  const { user, setRole } = useAuthStore();

  const roleQuery = useQuery({
    queryKey: ["role", user?.id],
    queryFn: () => fetchUserRole(user?.id ?? ""),
    enabled: !!user?.id,
    onSuccess: (value) => setRole(value)
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        roleQuery.refetch();
      }
    }, [roleQuery, user?.id])
  );

  useEffect(() => {
    if (!roleQuery.isLoading && roleQuery.data !== "admin") {
      router.replace("/(tabs)");
    }
  }, [roleQuery.data, roleQuery.isLoading, router]);

  const { data: books } = useQuery({
    queryKey: ["admin-books"],
    queryFn: () => fetchBooks(),
    enabled: roleQuery.data === "admin"
  });

  const { data: athkar } = useQuery({
    queryKey: ["admin-athkar-categories"],
    queryFn: () => fetchAthkarCategories(),
    enabled: roleQuery.data === "admin"
  });

  if (roleQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text variant="body" muted>
            Verifying admin access...
          </Text>
        </View>
      </Screen>
    );
  }

  if (roleQuery.data !== "admin") {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text variant="body" muted>
            Redirecting to your dashboard...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">Admin Dashboard</Text>
        <Text variant="body" muted>
          Control the platform experience and content quality.
        </Text>
      </View>

      <Section title="Platform Overview">
        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text variant="caption" muted>
              Resources
            </Text>
            <Text variant="heading">{books?.length ?? 0}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="caption" muted>
              Athkar Categories
            </Text>
            <Text variant="heading">{athkar?.length ?? 0}</Text>
          </Card>
        </View>
      </Section>

      <Section title="Manage Content" subtitle="Live controls connected to Supabase.">
        <Card style={styles.actionCard}>
          <ListItem
            title="Manage Books & Resources"
            subtitle="Add, edit, and retire library assets."
            onPress={() => {}}
          />
          <ListItem
            title="Update Library Metadata"
            subtitle="Refresh categories, tags, and metadata."
            onPress={() => {}}
          />
          <ListItem
            title="Edit Athkar"
            subtitle="Curate and reorder athkar content."
            onPress={() => {}}
          />
          <ListItem
            title="Manage Notes Categories"
            subtitle="Define the structure for user notes."
            onPress={() => {}}
          />
        </Card>
      </Section>

      <Section title="Future Ready" subtitle="Planned controls with secure RLS flows.">
        <Card style={styles.actionCard}>
          <ListItem
            title="Manage Users"
            subtitle="Review accounts and activity."
            onPress={() => {}}
          />
          <ListItem
            title="Change Roles"
            subtitle="Assign admin and editor privileges."
            onPress={() => {}}
          />
          <ListItem
            title="Toggle Access"
            subtitle="Control permissions per feature."
            onPress={() => {}}
          />
          <ListItem
            title="Manage Store Items"
            subtitle="Create premium bundles and pricing."
            onPress={() => {}}
          />
        </Card>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs
  },
  loading: {
    gap: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg
  },
  stats: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  statCard: {
    flex: 1,
    gap: theme.spacing.xs
  },
  actionCard: {
    gap: theme.spacing.sm
  }
});
