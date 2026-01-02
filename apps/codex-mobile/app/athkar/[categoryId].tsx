import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { fetchAthkarItems } from '@/services/athkar';
import { colors, spacing, typography } from '@/theme';

export default function AthkarDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { data = [] } = useQuery({
    queryKey: ['athkar-items', categoryId],
    queryFn: () => fetchAthkarItems(categoryId ?? ''),
    enabled: Boolean(categoryId)
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        {data.map((item) => (
          <Card key={item.id}>
            <Text style={styles.arabic}>{item.arabic_text}</Text>
            <Text style={styles.translation}>{item.translation}</Text>
            {item.transliteration ? (
              <Text style={styles.transliteration}>{item.transliteration}</Text>
            ) : null}
            <Text style={styles.repeat}>Repeat {item.repeat}x</Text>
          </Card>
        ))}
        {!data.length && <Text style={styles.empty}>No athkar found for this category.</Text>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md
  },
  arabic: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 32
  },
  translation: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: spacing.sm
  },
  transliteration: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs
  },
  repeat: {
    color: colors.accent,
    ...typography.caption,
    marginTop: spacing.sm
  },
  empty: {
    color: colors.textMuted,
    ...typography.body
  }
});
