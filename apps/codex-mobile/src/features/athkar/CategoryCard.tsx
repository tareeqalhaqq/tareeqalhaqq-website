import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { AthkarCategory } from '@/services/types';

export function CategoryCard({ category, onPress }: { category: AthkarCategory; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View>
        <Text style={styles.title}>{category.name}</Text>
        {category.time_of_day ? <Text style={styles.subtitle}>{category.time_of_day}</Text> : null}
      </View>
      <Text style={styles.slug}>{category.slug.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
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
  slug: {
    color: colors.accent,
    ...typography.caption
  }
});
