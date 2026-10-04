import "../src/theme/global.css"
import "../src/locals/i18n"
import React from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ThemeProvider, useAppTheme } from "@/theme/ThemeContext"
import { LanguageProvider } from "@/locals/LanguageContext"
import { DirectionProvider } from "@/locals/DirectionProvider"
import { ApiProvider } from "@/services/context/ApiContext"
import { initialServices } from "@/services/initialServices"
import { SnackbarHost } from "@/components/feedback/snackbar"

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
      <SnackbarHost />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <DirectionProvider>
            <ApiProvider services={initialServices}>
              <RootNavigator />
            </ApiProvider>
          </DirectionProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
