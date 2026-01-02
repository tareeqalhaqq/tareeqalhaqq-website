import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { CollectionItem } from '@/features/collection/CollectionItem';
import { fetchCollection, togglePinned } from '@/services/collection';
import { useAuth } from '@/services/auth';
import { colors, spacing, typography } from '@/theme';

export default function CollectionScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ['collection', session?.user.id],
    queryFn: () => fetchCollection(session?.user.id ?? ''),
    enabled: Boolean(session?.user.id)
  });

  const pinned = data.filter((item) => item.pinned);
  const saved = data.filter((item) => !item.pinned);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title="My Collection" subtitle="Saved, pinned, downloaded" />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pinned</Text>
          <View style={styles.list}>
            {pinned.map((item) => (
              <CollectionItem
                key={item.id}
                item={item}
                onTogglePinned={async () => {
                  await togglePinned(item.id, !item.pinned);
                  await queryClient.invalidateQueries({ queryKey: ['collection'] });
                }}
              />
            ))}
            {!pinned.length && <Text style={styles.empty}>No pinned items yet.</Text>}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved</Text>
          <View style={styles.list}>
            {saved.map((item) => (
              <CollectionItem
                key={item.id}
                item={item}
                onTogglePinned={async () => {
                  await togglePinned(item.id, !item.pinned);
                  await queryClient.invalidateQueries({ queryKey: ['collection'] });
                }}
              />
            ))}
            {!saved.length && <Text style={styles.empty}>No saved items yet.</Text>}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.textSecondary,
    ...typography.body,
    fontWeight: '600'
  },
  list: {
    gap: spacing.sm
  },
  empty: {
    color: colors.textMuted,
    ...typography.caption
  }
});
