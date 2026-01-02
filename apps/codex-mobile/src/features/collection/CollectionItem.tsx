import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { UserLibrary } from '@/services/types';

export function CollectionItem({ item, onTogglePinned }: { item: UserLibrary; onTogglePinned?: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>{item.book?.title ?? 'Untitled'}</Text>
        <Text style={styles.subtitle}>{item.book?.author ?? 'Unknown author'}</Text>
      </View>
      <TouchableOpacity style={styles.pill} onPress={onTogglePinned}>
        <Text style={styles.pillText}>{item.pinned ? 'Pinned' : 'Pin'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  info: {
    flex: 1
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
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceHighlight
  },
  pillText: {
    color: colors.accent,
    ...typography.caption
  }
});
