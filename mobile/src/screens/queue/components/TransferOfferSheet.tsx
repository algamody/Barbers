import React from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RTLIcon } from "@/components/ui/rtl-icon"
import { useCountdown } from "@/hooks/useCountdown"
import { IconClock, IconScissors, IconArrowsExchange, IconSparkles } from "@tabler/icons-react-native"

interface TransferOfferSheetProps {
  visible: boolean
  offer: {
    offeredStaffId: string
    offeredStaffName: string
    expiresAt: string
    reasonAr: string
  } | null | undefined
  onAccept: () => void
  onDecline: () => void
  loading?: boolean
}

export function TransferOfferSheet({
  visible,
  offer,
  onAccept,
  onDecline,
  loading = false,
}: TransferOfferSheetProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const countdown = useCountdown(offer?.expiresAt, {
    onExpire: onDecline,
  })

  if (!offer) return null

  return (
    <BottomSheet
      visible={visible}
      onClose={onDecline}
      title={t("Instant Chair Transfer Offer!")}
    >
      <View className="gap-4 pb-4">
        {/* Banner with 120-sec Countdown */}
        <View
          style={{
            backgroundColor: "rgba(232, 114, 42, 0.08)",
            borderColor: colors.gold,
          }}
          className="p-4 rounded-2xl border flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2">
            <RTLIcon>
              <IconArrowsExchange size={22} color={colors.gold} strokeWidth={2.2} />
            </RTLIcon>
            <View>
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                {t("Opportunity to skip wait")}
              </Text>
              <Text style={{ color: colors.muted }} className="text-2xs">
                {t("Offer response deadline")}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5">
            <IconClock size={16} color={colors.gold} />
            <Text
              style={{ color: colors.gold }}
              className="text-lg font-extrabold font-mono"
            >
              {countdown.formatted}
            </Text>
          </View>
        </View>

        {/* Offer Description Card */}
        <View
          style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
          className="p-4 rounded-2xl border gap-2.5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                style={{ backgroundColor: colors.gold }}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <IconScissors size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={{ color: colors.muted }} className="text-2xs">
                  {t("Proposed Barber")}
                </Text>
                <Text style={{ color: colors.text }} className="text-sm font-extrabold">
                  {offer.offeredStaffName}
                </Text>
              </View>
            </View>

            <Badge variant="gold" label={t("Vacant Now")} />
          </View>

          <Text style={{ color: colors.muted }} className="text-xs leading-relaxed">
            {offer.reasonAr}
          </Text>
        </View>

        {/* Actions */}
        <View className="gap-2 pt-2">
          <Button
            variant="default"
            size="lg"
            label={t("Accept Transfer & Take Chair")}
            loading={loading}
            onPress={onAccept}
            fullWidth
          />
          <Button
            variant="outline"
            size="default"
            label={t("Stay in current queue with my barber")}
            disabled={loading}
            onPress={onDecline}
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  )
}
