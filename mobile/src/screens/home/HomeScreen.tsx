import React, { useState, useEffect } from "react"
import { View, Text, Pressable, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { defaultStorage } from "@/storage/asyncStorageAdapter"
import { IconScissors, IconSun, IconMoon, IconWorld, IconCheck } from "@tabler/icons-react-native"

export default function HomeScreen() {
  const { theme, colors, toggleTheme } = useAppTheme()
  const { lang, isRTL, setLanguage, t } = useAppLanguage()
  const [storageTestVal, setStorageTestVal] = useState<string>("...")

  useEffect(() => {
    async function testStorage() {
      await defaultStorage.setItem("test_foundation_key", "OK_AsyncStorage_Operational")
      const val = await defaultStorage.getItem("test_foundation_key")
      setStorageTestVal(val || "Failed")
    }
    testStorage()
  }, [])

  const isDark = theme === "dark"

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.bg }}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        className="flex-1"
      >
        {/* Header Branding */}
        <View className="items-center mt-6 mb-8">
          <View
            style={{ backgroundColor: colors.gold }}
            className="w-16 h-16 rounded-3xl items-center justify-center shadow-lg mb-4"
          >
            <IconScissors size={32} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text
            style={{ color: colors.text }}
            className="text-3xl font-bold tracking-wider mb-2"
          >
            {t("appName")}
          </Text>
          <Text
            style={{ color: colors.muted }}
            className="text-sm text-center px-4 leading-relaxed"
          >
            {t("welcomeSubtitle")}
          </Text>
        </View>

        {/* Foundation Status Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="p-5 rounded-3xl border mb-6 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View
                style={{ backgroundColor: colors.successBg }}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <IconCheck size={18} color={colors.success} strokeWidth={2.5} />
              </View>
              <Text style={{ color: colors.text }} className="font-bold text-base">
                {t("systemStatus")}
              </Text>
            </View>
            <View
              style={{ backgroundColor: colors.successBg, borderColor: colors.success }}
              className="px-2.5 py-1 rounded-full border"
            >
              <Text style={{ color: colors.success }} className="text-xs font-semibold">
                Phase 1 Active
              </Text>
            </View>
          </View>

          <Text style={{ color: colors.textSub }} className="text-xs leading-5 mb-3">
            {t("systemReady")}
          </Text>

          <View
            style={{ backgroundColor: colors.cardAlt }}
            className="p-3 rounded-2xl flex-row items-center justify-between"
          >
            <Text style={{ color: colors.muted }} className="text-xs">
              Storage Adapter:
            </Text>
            <Text style={{ color: colors.gold }} className="text-xs font-bold font-mono">
              {storageTestVal}
            </Text>
          </View>
        </View>

        {/* Controls Grid */}
        <View className="gap-3">
          {/* Theme Toggle Button */}
          <Pressable
            onPress={toggleTheme}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="p-4 rounded-2xl border flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              {isDark ? (
                <IconSun size={20} color={colors.gold} strokeWidth={2} />
              ) : (
                <IconMoon size={20} color={colors.gold} strokeWidth={2} />
              )}
              <Text style={{ color: colors.text }} className="font-semibold text-sm">
                {t("theme")}
              </Text>
            </View>
            <Text style={{ color: colors.muted }} className="text-xs font-medium uppercase">
              {isDark ? t("dark") : t("light")}
            </Text>
          </Pressable>

          {/* Language Toggle Button */}
          <Pressable
            onPress={() => setLanguage(lang === "ar" ? "en" : "ar")}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="p-4 rounded-2xl border flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <IconWorld size={20} color={colors.gold} strokeWidth={2} />
              <Text style={{ color: colors.text }} className="font-semibold text-sm">
                {t("language")}
              </Text>
            </View>
            <Text style={{ color: colors.muted }} className="text-xs font-medium">
              {lang === "ar" ? "العربية (RTL)" : "English (LTR)"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
