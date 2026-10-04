import React from "react"
import { View, Text, Image } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/ui/copy-button"
import type { TUserProfile } from "@/typings"
import { IconSparkles, IconPhone } from "@tabler/icons-react-native"

interface ProfileHeaderProps {
  profile: TUserProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  return (
    <Card
      variant="elevated"
      className="p-5 border border-border-light dark:border-border-dark mb-4"
    >
      <View className="flex-row items-center gap-4 mb-4">
        {profile.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            className="w-16 h-16 rounded-full bg-surface-altLight dark:bg-surface-altDark"
          />
        ) : (
          <View
            style={{ backgroundColor: colors.gold }}
            className="w-16 h-16 rounded-full items-center justify-center"
          >
            <Text className="text-white text-xl font-extrabold">
              {profile.name.charAt(0)}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text style={{ color: colors.text }} className="text-base font-extrabold mb-1">
            {profile.name}
          </Text>
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <IconPhone size={13} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="text-xs">
              {profile.phone}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <IconSparkles size={14} color={colors.gold} />
            <Text style={{ color: colors.gold }} className="text-xs font-bold font-mono">
              {profile.points} {t("Loyalty Points")}
            </Text>
          </View>
        </View>
      </View>

      {/* Wallet ID */}
      <View
        style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
        className="p-3 rounded-xl border flex-row items-center justify-between"
      >
        <View>
          <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
            {t("Wallet ID")}:
          </Text>
          <Text style={{ color: colors.text }} className="text-xs font-mono font-bold">
            {profile.walletId}
          </Text>
        </View>
        <CopyButton text={profile.walletId} label={t("Copy")} />
      </View>
    </Card>
  )
}
