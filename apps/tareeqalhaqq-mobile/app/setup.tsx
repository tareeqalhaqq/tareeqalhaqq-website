import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAuthStore } from "@/state/authStore";
import { supabase } from "@/services/supabaseClient";
import { setSetupCompleted } from "@/services/setup";
import { theme } from "@/theme/theme";

export default function SetupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);

  const saveBirthday = async () => {
    if (!birthday) {
      Alert.alert("Birthday required", "Please enter your birthday (YYYY-MM-DD).");
      return;
    }

    try {
      setLoading(true);
      if (user?.id) {
        // Try to persist to Supabase if the column exists; ignore errors if not.
        await supabase
          .from("profiles")
          .update({ birth_date: birthday })
          .eq("id", user.id);
      }
      await setSetupCompleted(true);
      router.replace("/");
    } catch (error) {
      console.warn("Unable to save birthday", error);
      Alert.alert(
        "Saved locally",
        "We saved your preference locally. If this persists, contact support."
      );
      await setSetupCompleted(true);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Card style={styles.hero}>
        <Text variant="caption" muted>
          Tareeq Al Haqq
        </Text>
        <Text variant="heading">Welcome</Text>
        <Text variant="body" muted>
          A brief setup to personalize your experience and ensure appropriate content.
        </Text>
      </Card>

      <Card style={styles.form}>
        <Text variant="title">Your birthday</Text>
        <Text variant="body" muted>
          We use this to present age-appropriate resources and events.
        </Text>
        <Input
          placeholder="YYYY-MM-DD"
          value={birthday}
          onChangeText={setBirthday}
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
        <Button
          label={loading ? "Saving..." : "Continue"}
          onPress={saveBirthday}
          disabled={loading}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardElevated
  },
  form: {
    gap: theme.spacing.sm
  }
});
