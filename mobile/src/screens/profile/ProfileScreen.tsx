import React, { useMemo, useState, useEffect } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/feedback/skeleton"
import { showSnackbar } from "@/components/feedback/snackbar"
import { ProfileHeader } from "./components/ProfileHeader"
import { RewardCard } from "./components/RewardCard"
import { SettingsCard } from "./components/SettingsCard"
import type { TUserProfile } from "@/typings"

export default function ProfileScreen() {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [liveProfile, setLiveProfile] = useState<TUserProfile | null>(null)

  // Query user profile & rewards via use() hook
  const profileRequest = useMemo(() => api.user.getProfile(), [api])
  const { data: initialProfile, isLoading: profileLoading } = use(profileRequest)

  const rewardsRequest = useMemo(() => api.user.getRewards(), [api])
  const { data: rewards, isLoading: rewardsLoading } = use(rewardsRequest)

  useEffect(() => {
    if (initialProfile) {
      setLiveProfile(initialProfile)
    }
  }, [initialProfile])

  const profile = liveProfile || initialProfile

  const handleClaimReward = async (rewardId: string) => {
    const res = await api.user.claimReward(rewardId)
    if (res.success) {
      // Re-fetch profile to update points
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
        <Skeleton width="100%" height={120} rounded="2xl" className="mb-4" />
        <Skeleton width="100%" height={140} rounded="2xl" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text style={{ color: colors.text }} className="text-base font-extrabold">
            {t("Profile")}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} className="flex-1">
        {/* Profile Info Card */}
        <ProfileHeader profile={profile} />

        {/* Settings Card */}
        <SettingsCard />

        {/* Rewards Catalog */}
        <View className="mt-2">
          <Text style={{ color: colors.text }} className="font-extrabold text-sm mb-3">
            {t("Available Discount Coupons")} ({t("Redeem your points for discounts")})
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
                onClaim={handleClaimReward}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
