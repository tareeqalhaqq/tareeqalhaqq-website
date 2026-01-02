import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";

export const Input = ({ style, ...props }: TextInputProps) => {
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      style={[styles.input, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.cardElevated,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border
  }
});
