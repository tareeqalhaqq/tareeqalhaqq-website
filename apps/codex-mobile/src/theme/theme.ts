import { colors, radii, spacing, shadows } from "./tokens";

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography: {
    heading: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: colors.textPrimary
    },
    title: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.textPrimary
    },
    body: {
      fontSize: 16,
      fontWeight: "500" as const,
      color: colors.textSecondary
    },
    caption: {
      fontSize: 12,
      fontWeight: "500" as const,
      color: colors.textMuted
    }
  }
};
