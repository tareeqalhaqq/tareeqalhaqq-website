import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Props = {
  title: string;
  subtitle?: string | null;
  trailing?: ReactNode;
  onPress?: () => void;
};

export const ListItem = ({ title, subtitle, trailing, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.body}>
        <Text variant="body" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pressed: {
    backgroundColor: theme.colors.card
  },
  body: {
    flex: 1,
    paddingRight: theme.spacing.sm
  },
  title: {
    color: theme.colors.textPrimary
  }
});
