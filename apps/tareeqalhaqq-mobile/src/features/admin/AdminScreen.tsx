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
import { Button } from "@/components/Button";
import * as Linking from "expo-linking";

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
      <Card style={styles.hero}>
        <Text variant="caption" muted>
          Admin
        </Text>
        <Text variant="heading">Platform command center</Text>
        <Text variant="body" muted>
          Manage resources, athkar, and metadata with RLS-safe controls.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.statCard}>
            <Text variant="caption" muted>
              Resources
            </Text>
            <Text variant="title">{books?.length ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="caption" muted>
              Athkar categories
            </Text>
            <Text variant="title">{athkar?.length ?? 0}</Text>
          </View>
        </View>
        <Button
          label="Open main admin console"
          onPress={() => Linking.openURL("https://tareeqalhaqq.org/dashboard")}
          variant="primary"
        />
      </Card>

      <Section title="Platform Overview">
        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text variant="caption" muted>
              Live controls
            </Text>
            <Text variant="heading">Library</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="caption" muted>
              Data source
            </Text>
            <Text variant="heading">Supabase (RLS)</Text>
          </Card>
        </View>
      </Section>

      <Section
        title="Manage Content"
        subtitle="Admin actions are managed on the main site."
      >
        <Card style={styles.actionCard}>
          <ListItem
            title="Manage Books & Resources"
            subtitle="Add, edit, and retire library assets on the main site."
            onPress={() => Linking.openURL("https://tareeqalhaqq.org/dashboard")}
          />
          <ListItem
            title="Update Library Metadata"
            subtitle="Refresh categories, tags, and metadata on the main site."
            onPress={() => Linking.openURL("https://tareeqalhaqq.org/dashboard")}
          />
          <ListItem
            title="Edit Athkar"
            subtitle="Curate and reorder athkar content from the main site."
            onPress={() => Linking.openURL("https://tareeqalhaqq.org/dashboard")}
          />
          <ListItem
            title="Manage Notes Categories"
            subtitle="Define the structure for user notes on the main site."
            onPress={() => Linking.openURL("https://tareeqalhaqq.org/dashboard")}
          />
        </Card>
      </Section>

      <Section title="Academy" subtitle="Redirect to the academy experience.">
        <Card style={styles.actionCard}>
          <Text variant="body" muted>
            Markaz Al Haqq Academy delivers structured learning cohorts.
          </Text>
          <Button
            label="Go to Academy"
            variant="secondary"
            onPress={() => Linking.openURL("https://markazalhaqq.org")}
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
  hero: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardElevated,
    borderColor: theme.colors.accentSoft
  },
  heroStats: {
    flexDirection: "row",
    gap: theme.spacing.sm
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
