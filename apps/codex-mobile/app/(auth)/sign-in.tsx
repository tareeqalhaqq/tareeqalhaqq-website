import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing, typography } from '@/theme';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Sign-in failed', error.message);
      return;
    }

    router.replace('/(tabs)/dashboard');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your Codex journey.</Text>
      </View>
      <View style={styles.form}>
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <Button label={loading ? 'Signing in...' : 'Sign In'} onPress={handleSignIn} />
        <Text style={styles.helper}>Use the same credentials as the website.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.xl
  },
  hero: {
    marginTop: spacing.xl,
    gap: spacing.sm
  },
  title: {
    color: colors.textPrimary,
    ...typography.heading
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.body
  },
  form: {
    gap: spacing.md
  },
  helper: {
    color: colors.textMuted,
    ...typography.caption,
    textAlign: 'center'
  }
});
