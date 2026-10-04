import React from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TRewardItem } from "@/typings"
import { IconGift, IconTicket } from "@tabler/icons-react-native"

interface RewardCardProps {
  reward: TRewardItem
  userPoints: number
  onClaim: (rewardId: string) => void
}

export function RewardCard({ reward, userPoints, onClaim }: RewardCardProps) {
  const { colors } = useAppTheme()
  const { t, lang } = useAppLanguage()

  const canClaim = userPoints >= reward.pointsRequired
  const title = lang === "ar" ? reward.title : reward.titleEn
  const desc = lang === "ar" ? reward.description : reward.descriptionEn

  return (
    <Card className="p-4 border border-border-light dark:border-border-dark mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1 pe-2">
          <View
            style={{ backgroundColor: colors.gold }}
            className="w-8 h-8 rounded-xl items-center justify-center shadow-2xs"
          >
            <IconGift size={16} color="#ffffff" strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              {title}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {reward.pointsRequired} {t("Points")}
            </Text>
          </View>
        </View>

        <Badge variant="gold" label={reward.badge} />
      </View>

      <Text style={{ color: colors.muted }} className="text-xs leading-relaxed mb-3">
        {desc}
      </Text>

      <View className="flex-row items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
        <Text style={{ color: colors.muted }} className="text-2xs">
          {canClaim ? t("Sufficient points to claim") : t("Need more points")}
        </Text>

        <Button
          variant={canClaim ? "default" : "outline"}
          size="sm"
          label={t("Claim Reward")}
          disabled={!canClaim}
          onPress={() => onClaim(reward.id)}
        />
      </View>
    </Card>
  )
}
