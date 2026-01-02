import { colors, radii, spacing, shadows } from "./tokens";

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography: {
    heading: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.textPrimary
    },
    title: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.textPrimary
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      color: colors.textSecondary
    },
    caption: {
      fontSize: 12,
      fontWeight: "500" as const,
      color: colors.textMuted
    }
  }
};
