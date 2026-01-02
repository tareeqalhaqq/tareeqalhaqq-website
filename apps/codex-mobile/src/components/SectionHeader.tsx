import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  title: {
    color: colors.textPrimary,
    ...typography.title
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption
  }
});
