export type ThemeMode = "light" | "dark"

/**
 * Single source of truth for all color tokens and design primitives in the mobile app.
 * All UI primitives and components must reference these semantic tokens.
 */
export const TOKENS = {
  colors: {
    gold: {
      DEFAULT: "#e8722a",
      muted: "#a34e1a",
      light: "#f0a070",
    },
    primary: {
      DEFAULT: "#e8722a",
      foreground: "#ffffff",
    },
    success: {
      DEFAULT: "#4a8a5a",
      light: "#376640",
      bgDark: "#1a2e20",
      bgLight: "#e6f0e8",
    },
    danger: {
      DEFAULT: "#d94030",
      light: "#c83020",
      bgDark: "#2d1411",
      bgLight: "#fde8e6",
    },
    dark: {
      bg: "#0f0c0a",
      card: "#1c1612",
      cardAlt: "#150f0b",
      surface: "#221c17",
      border: "#2e2218",
      text: "#f5f0ea",
      textSub: "#c8bfb4",
      muted: "#6e6158",
      inputBg: "#1c1612",
      navBg: "#1c1612",
    },
    light: {
      bg: "#f5f5f5",
      card: "#ffffff",
      cardAlt: "#eeeeee",
      surface: "#ffffff",
      border: "#e0e0e0",
      text: "#111111",
      textSub: "#333333",
      muted: "#888888",
      inputBg: "#eeeeee",
      navBg: "#ffffff",
    },
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
} as const

export function getThemeColors(mode: ThemeMode) {
  const isDark = mode === "dark"
  const themeColors = isDark ? TOKENS.colors.dark : TOKENS.colors.light

  return {
    ...themeColors,
    gold: TOKENS.colors.gold.DEFAULT,
    goldMuted: isDark ? TOKENS.colors.gold.muted : TOKENS.colors.gold.light,
    primary: TOKENS.colors.primary.DEFAULT,
    primaryForeground: TOKENS.colors.primary.foreground,
    success: isDark ? TOKENS.colors.success.DEFAULT : TOKENS.colors.success.light,
    successBg: isDark ? TOKENS.colors.success.bgDark : TOKENS.colors.success.bgLight,
    danger: isDark ? TOKENS.colors.danger.DEFAULT : TOKENS.colors.danger.light,
    dangerBg: isDark ? TOKENS.colors.danger.bgDark : TOKENS.colors.danger.bgLight,
  }
}
