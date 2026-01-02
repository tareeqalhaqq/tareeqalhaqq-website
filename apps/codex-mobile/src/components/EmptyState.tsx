import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Props = {
  title: string;
  subtitle?: string;
};

export const EmptyState = ({ title, subtitle }: Props) => {
  return (
    <View style={styles.container}>
      <Text variant="title">{title}</Text>
      {subtitle ? (
        <Text variant="body" muted style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    gap: theme.spacing.xs
  },
  subtitle: {
    textAlign: "center"
  }
});
