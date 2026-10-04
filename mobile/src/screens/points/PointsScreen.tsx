import React, { useMemo, useState, useEffect } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/feedback/skeleton"
import { showSnackbar } from "@/components/feedback/snackbar"
import { RewardCard } from "@/screens/profile/components/RewardCard"
import type { TUserProfile } from "@/typings"
import { IconSparkles, IconGift, IconAward } from "@tabler/icons-react-native"

export default function PointsScreen() {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [liveProfile, setLiveProfile] = useState<TUserProfile | null>(null)

  const profileRequest = useMemo(() => api.user.getProfile(), [api])
  const { data: initialProfile, isLoading: profileLoading } = use(profileRequest)

  const rewardsRequest = useMemo(() => api.user.getRewards(), [api])
  const { data: rewards, isLoading: rewardsLoading } = use(rewardsRequest)

  useEffect(() => {
    if (initialProfile) setLiveProfile(initialProfile)
  }, [initialProfile])

  const profile = liveProfile || initialProfile

  const handleClaim = async (rewardId: string) => {
    const res = await api.user.claimReward(rewardId)
    if (res.success) {
      const updated = await api.user.getProfile()
      setLiveProfile(updated)
      showSnackbar({
        title: t("Reward claimed successfully!"),
        description: t("The discount has been added to your account balance and will be applied to your next booking."),
        type: "success",
      })
    } else {
      showSnackbar({
        title: t("Failed to claim reward"),
        description: res.error,
        type: "error",
      })
    }
  }

  if (profileLoading || !profile) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1 p-5">
        <View className="flex-row items-center gap-3 mb-6">
          <BackButton />
          <Skeleton width={140} height={22} rounded="md" />
        </View>
        <Skeleton width="100%" height={160} rounded="3xl" className="mb-4" />
        <Skeleton width="100%" height={100} rounded="2xl" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3 border-b border-border-light dark:border-border-dark">
        <BackButton />
        <Text style={{ color: colors.text }} className="text-base font-extrabold">
          {t("Loyalty Points & Rewards")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} className="flex-1">
        {/* Points Banner */}
        <Card variant="elevated" className="p-5 border border-border-light dark:border-border-dark mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <IconSparkles size={20} color={colors.gold} strokeWidth={2.2} />
              <Text style={{ color: colors.text }} className="font-extrabold text-sm">
                {t("Barbers Rewards Balance")}
              </Text>
            </View>
            <Badge variant="gold" label={t("Gold Level")} />
          </View>

          <View className="py-2">
            <Text style={{ color: colors.gold }} className="text-4xl font-extrabold font-mono">
              {profile.points}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs mt-1">
              {t("Points earned from your bookings and reviews")}
            </Text>
          </View>

          <View className="mt-3 p-3 rounded-xl bg-surface-altLight dark:bg-surface-altDark flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <IconAward size={18} color={colors.gold} />
              <Text style={{ color: colors.text }} className="text-2xs font-semibold">
                {t("Earn 15 extra points on every grooming completed")}
              </Text>
            </View>
          </View>
        </Card>

        {/* Available Rewards */}
        <Text style={{ color: colors.text }} className="font-extrabold text-sm mb-3">
          {t("Available Discount Coupons")}
        </Text>

        {rewardsLoading ? (
          <View className="gap-2.5">
            <Skeleton height={100} rounded="2xl" />
            <Skeleton height={100} rounded="2xl" />
          </View>
        ) : (
          rewards?.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={profile.points}
              onClaim={handleClaim}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
