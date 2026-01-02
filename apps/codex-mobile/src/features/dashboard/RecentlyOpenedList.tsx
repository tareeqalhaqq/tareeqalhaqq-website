import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/theme';
import { ReadingActivity } from '@/services/types';

export function RecentlyOpenedList({ items }: { items: ReadingActivity[] }) {
  if (!items.length) {
    return (
      <Card>
        <Text style={styles.empty}>No recent readings yet.</Text>
      </Card>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <Card key={item.id}>
          <Text style={styles.title}>{item.book?.title ?? 'Untitled'}</Text>
          <Text style={styles.subtitle}>Last opened {new Date(item.last_opened_at).toDateString()}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm
  },
  title: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600'
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption
  },
  empty: {
    color: colors.textMuted,
    ...typography.body
  }
});
