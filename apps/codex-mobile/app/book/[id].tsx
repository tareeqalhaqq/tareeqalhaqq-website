import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { fetchBookById } from '@/services/library';
import { addToCollection } from '@/services/collection';
import { useAuth } from '@/services/auth';
import { colors, spacing, typography } from '@/theme';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchBookById(id ?? ''),
    enabled: Boolean(id)
  });

  if (!data) {
    return (
      <Screen style={styles.loading}>
        <Text style={styles.loadingText}>Loading book...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cover} />
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.author}>{data.author}</Text>
        <Text style={styles.description}>{data.description}</Text>
        <Button
          label="Add to Collection"
          onPress={async () => {
            if (!session?.user.id) {
              return;
            }
            await addToCollection(session.user.id, data.id);
            await queryClient.invalidateQueries({ queryKey: ['collection'] });
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md
  },
  cover: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    backgroundColor: colors.surfaceHighlight
  },
  title: {
    color: colors.textPrimary,
    ...typography.heading
  },
  author: {
    color: colors.textMuted,
    ...typography.body
  },
  description: {
    color: colors.textSecondary,
    ...typography.body
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: colors.textMuted,
    ...typography.body
  }
});
