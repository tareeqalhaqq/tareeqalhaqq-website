import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { signInWithEmail } from "@/services/auth";
import { theme } from "@/theme/theme";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
    } catch (error) {
      Alert.alert("Sign-in failed", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text variant="heading">Tareeq Al Haqq</Text>
        <Text variant="body" muted>
          Begin your journey of knowledge with a focused, modern library.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text variant="title">Sign in</Text>
        <View style={styles.form}>
          <Input
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            label={loading ? "Signing in..." : "Continue"}
            onPress={handleSignIn}
            disabled={loading}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg
  },
  card: {
    gap: theme.spacing.md
  },
  form: {
    gap: theme.spacing.sm
  }
});
