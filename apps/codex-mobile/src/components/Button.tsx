import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, style, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.base, variant === 'secondary' ? styles.secondary : styles.primary, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: colors.accent
  },
  secondary: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border
  },
  label: {
    color: colors.background,
    fontWeight: '600'
  }
});
