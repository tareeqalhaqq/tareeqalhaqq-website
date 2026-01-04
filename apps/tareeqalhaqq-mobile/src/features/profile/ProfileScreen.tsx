import { StyleSheet, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { useAuthStore } from "@/state/authStore";
import { signOut } from "@/services/auth";
import { theme } from "@/theme/theme";

export const ProfileScreen = () => {
  const { user, role } = useAuthStore();
  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "User";

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">Profile</Text>
        <Text variant="body" muted>
          Manage your account and preferences.
        </Text>
      </View>

      <Card style={styles.profileCard}>
        <Text variant="heading">{displayName}</Text>
        <Text variant="body" muted>
          {user?.email ?? "No email available"}
        </Text>
        <View style={styles.badges}>
          <Text variant="caption" muted>
            Role: {role}
          </Text>
        </View>
      </Card>

      <Section title="Account">
        <Card style={styles.detailCard}>
          <Text variant="title">Security</Text>
          <Text variant="body" muted>
            Two-factor authentication and login activity will appear here.
          </Text>
        </Card>
        <Card style={styles.detailCard}>
          <Text variant="title">Preferences</Text>
          <Text variant="body" muted>
            Theme, reading style, and notification settings.
          </Text>
        </Card>
      </Section>

      <Button label="Sign out" onPress={signOut} variant="secondary" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs
  },
  profileCard: {
    gap: theme.spacing.xs
  },
  badges: {
    marginTop: theme.spacing.xs
  },
  detailCard: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs
  }
});
