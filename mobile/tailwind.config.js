/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
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
        surface: {
          dark: "#1c1612",
          light: "#ffffff",
          altDark: "#150f0b",
          altLight: "#eeeeee",
        },
        border: {
          dark: "#2e2218",
          light: "#e0e0e0",
        },
        content: {
          dark: "#f5f0ea",
          light: "#111111",
          mutedDark: "#6e6158",
          mutedLight: "#888888",
        },
      },
    },
  },
  plugins: [],
}
