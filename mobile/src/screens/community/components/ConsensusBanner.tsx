import React from "react"
import { View, Text } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TCommunityUpdateData } from "@/typings"
import { IconUsers, IconShieldCheck, IconClock, IconAlertCircle } from "@tabler/icons-react-native"

interface ConsensusBannerProps {
  data: TCommunityUpdateData
}

export function ConsensusBanner({ data }: ConsensusBannerProps) {
  const { t } = useTranslation()
  const { colors } = useAppTheme()

  const isOfficial = data.consensusStatus === "official"
  const isVerified = data.consensusStatus === "community_verified"

  return (
    <Card
      variant="elevated"
      className="p-5 border border-border-light dark:border-border-dark mb-4"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {isOfficial ? (
            <IconShieldCheck size={20} color="#10b981" strokeWidth={2.2} />
          ) : isVerified ? (
            <IconUsers size={20} color={colors.gold} strokeWidth={2.2} />
          ) : (
            <IconAlertCircle size={20} color="#eab308" strokeWidth={2.2} />
          )}
          <Text style={{ color: colors.text }} className="font-extrabold text-sm">
            {t("Field Salon Status")}
          </Text>
        </View>

        <Badge
          variant={isOfficial ? "success" : isVerified ? "gold" : "outline"}
          label={
            isOfficial
              ? t("Official Salon Update")
              : isVerified
              ? t("Verified by Community")
              : t("Unverified (Voting in progress)")
          }
        />
      </View>

      {/* Main Status Row */}
      <View
        style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
        className="p-3.5 rounded-2xl border flex-row items-center justify-around mb-2"
      >
        <View className="items-center">
          <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
            {t("Doors Status")}
          </Text>
          <Text
            style={{ color: data.isOpen ? "#10b981" : "#ef4444" }}
            className="font-extrabold text-sm"
          >
            {data.isOpen ? t("Open & Welcoming") : t("Currently Closed")}
          </Text>
        </View>

        <View style={{ borderColor: colors.border }} className="h-6 border-s" />

        <View className="items-center">
          <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
            {t("Approximate Queue")}
          </Text>
          <Text style={{ color: colors.gold }} className="font-extrabold text-sm font-mono">
            ~{data.waitingCount} {t("Customers waiting")}
          </Text>
        </View>

        <View style={{ borderColor: colors.border }} className="h-6 border-s" />

        <View className="items-center">
          <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
            {t("Confirmation Votes")}
          </Text>
          <Text style={{ color: colors.text }} className="font-extrabold text-sm font-mono">
            {data.openCount + data.closedCount}
          </Text>
        </View>
      </View>

      <Text style={{ color: colors.muted }} className="text-2xs text-center leading-relaxed">
        {t("Status is verified once 2-3 customers vote. Reports expire after 24 hours.")}
      </Text>
    </Card>
  )
}
