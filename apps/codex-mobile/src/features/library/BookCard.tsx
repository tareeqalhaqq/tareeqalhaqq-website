import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Book } from '@/services/types';

export function BookCard({ book, onPress }: { book: Book; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cover} />
      <View style={styles.content}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {book.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border
  },
  cover: {
    width: 56,
    height: 76,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight
  },
  content: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600'
  },
  author: {
    color: colors.textMuted,
    ...typography.caption
  },
  description: {
    color: colors.textSecondary,
    ...typography.caption
  }
});
