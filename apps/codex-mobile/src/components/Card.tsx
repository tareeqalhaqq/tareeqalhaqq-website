import { View, ViewProps, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";

export const Card = ({ style, ...props }: ViewProps) => {
  return <View style={[styles.card, style]} {...props} />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  }
});
