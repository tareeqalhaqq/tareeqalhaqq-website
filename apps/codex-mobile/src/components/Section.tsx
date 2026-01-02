import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { theme } from "@/theme/theme";

type Props = {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
};

export const Section = ({ title, children, trailing }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="title">{title}</Text>
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
  }
});
