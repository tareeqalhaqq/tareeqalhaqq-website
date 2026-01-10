import { StyleSheet, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/state/authStore";
import { signOut } from "@/services/auth";
import {
  fetchProfileDetails,
  Madhab,
  updateProfileDetails
} from "@/services/profiles";
import { theme } from "@/theme/theme";

export const ProfileScreen = () => {
  const { user } = useAuthStore();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [madhab, setMadhab] = useState<Madhab | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "User";

  const madhabOptions = useMemo(
    () => [
      { label: "Hanafi", value: "hanafi" as const },
      { label: "Shafi'i", value: "shafii" as const },
      { label: "Maliki", value: "maliki" as const },
      { label: "Hanbali", value: "hanbali" as const }
    ],
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        return;
      }

      const data = await fetchProfileDetails(user.id);
      if (!data) {
        return;
      }

      setDateOfBirth(data.date_of_birth ?? "");
      setMadhab(data.madhab ?? null);
    };

    loadProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const { error } = await updateProfileDetails(user.id, {
      date_of_birth: dateOfBirth.trim() ? dateOfBirth.trim() : null,
      madhab
    });

    if (error) {
      setStatusMessage("Unable to save profile details.");
    } else {
      setStatusMessage("Profile details saved.");
    }

    setIsSaving(false);
  };

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
        <Text variant="caption" muted>
          Member access enabled
        </Text>
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

      <Section title="Personal details">
        <Card style={styles.detailCard}>
          <Text variant="title">Date of birth</Text>
          <Text variant="caption" muted>
            Use YYYY-MM-DD so it matches your profile record.
          </Text>
          <Input
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="2002-01-24"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
        </Card>
        <Card style={styles.detailCard}>
          <Text variant="title">Madhab</Text>
          <Text variant="caption" muted>
            Select the school of thought you follow.
          </Text>
          <View style={styles.madhabOptions}>
            {madhabOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={madhab === option.value}
                onPress={() => setMadhab(option.value)}
              />
            ))}
          </View>
        </Card>
        <Button
          label={isSaving ? "Saving..." : "Save profile details"}
          onPress={handleSave}
          disabled={isSaving}
        />
        {statusMessage ? (
          <Text variant="caption" muted>
            {statusMessage}
          </Text>
        ) : null}
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
  detailCard: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  madhabOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs
  }
});
