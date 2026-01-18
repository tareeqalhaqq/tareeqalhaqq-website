import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";

type Variant = "body" | "caption" | "title" | "heading";

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
};

export const Text = ({ variant = "body", muted, style, ...props }: Props) => {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        muted && styles.muted,
        style
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textSecondary
  },
  muted: {
    color: theme.colors.textMuted
  },
  body: {
    ...theme.typography.body
  },
  caption: {
    ...theme.typography.caption
  },
  title: {
    ...theme.typography.title
  },
  heading: {
    ...theme.typography.heading
  }
});
