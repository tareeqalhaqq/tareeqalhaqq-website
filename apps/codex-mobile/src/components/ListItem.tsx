import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: string;
};

export function ListItem({ title, subtitle, onPress, trailing }: ListItemProps) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container style={styles.container} onPress={onPress as any}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  subtitle: {
    color: colors.textMuted,
    ...typography.caption
  },
  trailing: {
    color: colors.accent,
    ...typography.caption
  }
});
