import { Pressable, PressableProps, StyleSheet } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Variant = "primary" | "secondary" | "ghost";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
};

export const Button = ({ label, variant = "primary", style, ...props }: Props) => {
  const isPrimary = variant === "primary";

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
        style={[
          styles.label,
          isPrimary ? styles.labelOnPrimary : styles.labelOnSurface,
          variant === "ghost" && styles.labelGhost
        ]}
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
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.xs
  },
  pressed: {
    opacity: 0.8
  },
  primary: {
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
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
    fontWeight: "600"
  },
  labelOnPrimary: {
    color: "#0A0C0F"
  },
  labelOnSurface: {
    color: theme.colors.textPrimary
  },
  labelGhost: {
    color: theme.colors.accent
  }
});
