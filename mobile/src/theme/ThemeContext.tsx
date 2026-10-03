import React, { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme as useNativeWindColorScheme } from "nativewind"
import { type ThemeMode, getThemeColors } from "./tokens"
import { defaultStorage } from "../storage/asyncStorageAdapter"
import { STORAGE_KEYS } from "../constants"

interface ThemeContextValue {
  theme: ThemeMode
  colors: ReturnType<typeof getThemeColors>
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark")
  const { setColorScheme } = useNativeWindColorScheme()

  useEffect(() => {
    async function loadSavedTheme() {
      const saved = await defaultStorage.getItem(STORAGE_KEYS.THEME)
      if (saved === "light" || saved === "dark") {
        setThemeState(saved)
        setColorScheme(saved)
      } else {
        setColorScheme("dark")
      }
    }
    loadSavedTheme()
  }, [setColorScheme])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    setColorScheme(newTheme)
    defaultStorage.setItem(STORAGE_KEYS.THEME, newTheme)
  }

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
  }

  const colors = getThemeColors(theme)

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useAppTheme must be used within ThemeProvider")
  }
  return ctx
}
