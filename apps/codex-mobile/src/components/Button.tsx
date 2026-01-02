import { Pressable, PressableProps, StyleSheet } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Variant = "primary" | "secondary" | "ghost";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
};

export const Button = ({ label, variant = "primary", style, ...props }: Props) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style
      ]}
      {...props}
    >
      <Text
        variant="body"
        style={[styles.label, variant === "ghost" && styles.labelGhost]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.8
  },
  primary: {
    backgroundColor: theme.colors.accent
  },
  secondary: {
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  ghost: {
    backgroundColor: "transparent"
  },
  label: {
    color: "#1C160B",
    fontWeight: "600"
  },
  labelGhost: {
    color: theme.colors.accent
  }
});
