import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Props = {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
  subtitle?: string;
};

export const Section = ({ title, children, trailing, subtitle }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text variant="title">{title}</Text>
          {subtitle ? (
            <Text variant="body" muted>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleBlock: {
    gap: theme.spacing.xs,
    flex: 1
  }
});
