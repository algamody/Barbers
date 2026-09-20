export type Theme = "dark" | "light"

export function getC(theme: Theme) {
  const dark = {
    bg: "#0f0c0a",
    card: "#1c1612",
    cardAlt: "#150f0b",
    gold: "#e8722a",
    goldMuted: "#a34e1a",
    text: "#f5f0ea",
    textSub: "#c8bfb4",
    muted: "#6e6158",
    border: "#2e2218",
    green: "#4a8a5a",
    greenBg: "#1a2e20",
    red: "#d94030",
    inputBg: "#1c1612",
    navBg: "#1c1612",
    statusBar: "#0f0c0a",
  }
  const light = {
    bg: "#f5f5f5",
    card: "#ffffff",
    cardAlt: "#eeeeee",
    gold: "#e8722a",
    goldMuted: "#f0a070",
    text: "#111111",
    textSub: "#333333",
    muted: "#888888",
    border: "#e0e0e0",
    green: "#376640",
    greenBg: "#e6f0e8",
    red: "#c83020",
    inputBg: "#eeeeee",
    navBg: "#ffffff",
    statusBar: "#f5f5f5",
  }
  return theme === "dark" ? dark : light
}
