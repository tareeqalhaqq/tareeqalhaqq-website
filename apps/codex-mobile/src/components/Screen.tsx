import { ReactNode } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/theme/theme";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export const Screen = ({ children, scroll, contentStyle }: Props) => {
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentStyle]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.background, "#0F1419"]}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>{content}</SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  container: {
    flex: 1
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg
  }
});
