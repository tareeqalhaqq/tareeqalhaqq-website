import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export const Chip = ({ label, active, onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, active && styles.active]}
    >
      <Text variant="caption" style={active && styles.activeLabel}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  active: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent
  },
  activeLabel: {
    color: theme.colors.textPrimary
  }
});
