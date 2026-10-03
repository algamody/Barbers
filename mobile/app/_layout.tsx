import "../src/theme/global.css"
import "../src/locals/i18n"
import React from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ThemeProvider, useAppTheme } from "@/theme/ThemeContext"
import { LanguageProvider } from "@/locals/LanguageContext"
import { ApiProvider } from "@/services/context/ApiContext"
import { initialServices } from "@/services/initialServices"

function RootNavigator() {
  const { theme } = useAppTheme()

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ApiProvider services={initialServices}>
            <RootNavigator />
          </ApiProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
