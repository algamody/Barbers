import React from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconSun, IconMoon, IconWorld, IconAdjustments } from "@tabler/icons-react-native"

export function SettingsCard() {
  const { theme, colors, toggleTheme } = useAppTheme()
  const { lang, setLanguage, t } = useAppLanguage()

  const isDark = theme === "dark"

  return (
    <Card className="p-4 border border-border-light dark:border-border-dark mb-4">
      <View className="flex-row items-center gap-2 mb-3">
        <IconAdjustments size={18} color={colors.gold} strokeWidth={2.2} />
        <Text style={{ color: colors.text }} className="font-extrabold text-sm">
          {t("Settings")}
        </Text>
      </View>

      <View className="gap-3">
        {/* Theme Setting */}
        <View className="flex-row items-center justify-between py-2 border-b border-border-light dark:border-border-dark">
          <View>
            <Text style={{ color: colors.text }} className="text-xs font-semibold">
              {t("Theme")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {isDark ? t("Dark") : t("Light")}
            </Text>
          </View>

          <Button
            variant="outline"
            size="sm"
            label={isDark ? t("Enable Light Mode") : t("Enable Dark Mode")}
            icon={
              isDark ? (
                <IconSun size={15} color={colors.gold} />
              ) : (
                <IconMoon size={15} color={colors.gold} />
              )
            }
            onPress={toggleTheme}
          />
        </View>

        {/* Language Setting */}
        <View className="flex-row items-center justify-between py-2">
          <View>
            <Text style={{ color: colors.text }} className="text-xs font-semibold">
              {t("Language")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {lang === "ar" ? t("Arabic") : t("English")}
            </Text>
          </View>

          <Button
            variant="outline"
            size="sm"
            label={lang === "ar" ? t("English") : t("Arabic")}
            icon={<IconWorld size={15} color={colors.gold} />}
            onPress={() => setLanguage(lang === "ar" ? "en" : "ar")}
          />
        </View>
      </View>
    </Card>
  )
}
