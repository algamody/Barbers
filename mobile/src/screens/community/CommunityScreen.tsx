import React, { useState, useEffect, useMemo } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/feedback/skeleton"
import { showSnackbar } from "@/components/feedback/snackbar"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/feedback/empty-state"
import { ConsensusBanner } from "./components/ConsensusBanner"
import { ReportCard } from "./components/ReportCard"
import { SubmitReportModal } from "./components/SubmitReportModal"
import type { TCommunityReport, TCommunityUpdateData } from "@/typings"
import { IconUsers, IconPlus } from "@tabler/icons-react-native"

export default function CommunityScreen() {
  const { shopId } = useLocalSearchParams<{ shopId?: string }>()
  const targetShopId = shopId || "royal-cut"

  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [liveData, setLiveData] = useState<TCommunityUpdateData | null>(null)

  // Query initial data via use() hook
  const communityRequest = useMemo(
    () => api.community.getCommunityUpdate(targetShopId),
    [api, targetShopId]
  )
  const { data: initialData, isLoading } = use(communityRequest)

  const profileRequest = useMemo(() => api.user.getProfile(), [api])
  const { data: profile } = use(profileRequest)

  useEffect(() => {
    if (initialData) {
      setLiveData(initialData)
    }
  }, [initialData])

  // Real-time community subscription
  useEffect(() => {
    const unsubscribe = api.community.subscribeCommunity(targetShopId, (updated) => {
      setLiveData(updated)
    })
    return () => unsubscribe()
  }, [api, targetShopId])

  const communityData = liveData || initialData

  const handleVote = async (reportId: string, vote: "correct" | "incorrect") => {
    const res = await api.community.voteReport(targetShopId, {
      reportId,
      vote,
      timestamp: Date.now(),
    })
    if (res.success) {
      showSnackbar({
        title: t("Your vote was recorded successfully!"),
        description: t("Thank you for contributing to community accuracy."),
        type: "success",
      })
    }
  }

  const handleSubmitReport = async (
    data: Omit<TCommunityReport, "id" | "confirmedCount" | "unconfirmedCount">
  ) => {
    const res = await api.community.submitReport(targetShopId, data)
    if (res.success) {
      showSnackbar({
        title: t("Your report was published successfully!"),
        description: t("It will appear to other customers and be voted on."),
        type: "success",
      })
    }
  }

  if (isLoading || !communityData) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1 p-5">
        <View className="flex-row items-center gap-3 mb-6">
          <BackButton />
          <Skeleton width={160} height={22} rounded="md" />
        </View>
        <Skeleton width="100%" height={160} rounded="3xl" className="mb-4" />
        <Skeleton width="100%" height={100} rounded="2xl" className="mb-3" />
        <Skeleton width="100%" height={100} rounded="2xl" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <View>
            <Text style={{ color: colors.text }} className="text-base font-extrabold">
              {t("Community Updates")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {t("Live Customer Updates")}
            </Text>
          </View>
        </View>

        <Button
          variant="default"
          size="sm"
          label={t("Submit Status Update")}
          icon={<IconPlus size={14} color="#ffffff" />}
          onPress={() => setIsSubmitModalOpen(true)}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} className="flex-1">
        {/* Consensus Banner */}
        <ConsensusBanner data={communityData} />

        {/* Reports Feed */}
        <Text style={{ color: colors.text }} className="font-extrabold text-sm mb-3">
          {t("Latest Field Reports")} ({communityData.reports.length})
        </Text>

        {communityData.reports.length > 0 ? (
          communityData.reports.map((report) => (
            <ReportCard key={report.id} report={report} onVote={handleVote} />
          ))
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <IconUsers size={36} color={colors.gold} strokeWidth={1.5} />
            </EmptyStateIcon>
            <EmptyStateTitle>{t("No current reports")}</EmptyStateTitle>
            <EmptyStateDescription>
              {t("Be the first to share the salon status with the community.")}
            </EmptyStateDescription>
          </EmptyState>
        )}
      </ScrollView>

      {/* Submit Report Modal */}
      <SubmitReportModal
        visible={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        userName={profile?.name || t("Barbers Customer")}
        onSubmitReport={handleSubmitReport}
      />
    </SafeAreaView>
  )
}
