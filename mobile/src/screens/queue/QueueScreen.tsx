import React, { useState, useEffect, useMemo } from "react"
import { View, Text, ScrollView, Alert, Linking, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/feedback/skeleton"
import { showSnackbar } from "@/components/feedback/snackbar"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { RTLIcon } from "@/components/ui/rtl-icon"
import { QueueDomainService } from "@/services/domain/queue.domain"
import { AttendanceTimerCard } from "./components/AttendanceTimerCard"
import { CompanionsManagementCard } from "./components/CompanionsManagementCard"
import { QrScanModal } from "./components/QrScanModal"
import { TransferOfferSheet } from "./components/TransferOfferSheet"
import { ReviewSheet } from "./components/ReviewSheet"
import type { TGroupBooking } from "@/typings"
import {
  IconScissors,
  IconClock,
  IconUser,
  IconMapPin,
  IconQrcode,
  IconX,
  IconArrowRight,
  IconAlertTriangle,
  IconSparkles,
  IconPhoneCall,
  IconArrowsExchange,
  IconAward,
} from "@tabler/icons-react-native"

export default function QueueScreen() {
  const router = useRouter()
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  // Real-time live booking state
  const [liveBooking, setLiveBooking] = useState<TGroupBooking | null>(null)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReasonMessage, setCancelReasonMessage] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  // Transfer offer & review sheets state
  const [isTransferSheetOpen, setIsTransferSheetOpen] = useState(false)
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)

  // Query active booking via use() hook
  const activeBookingRequest = useMemo(() => api.booking.getActiveBooking(), [api])
  const { data: initialBooking, isLoading } = use(activeBookingRequest)

  useEffect(() => {
    if (initialBooking) {
      setLiveBooking(initialBooking)
    }
  }, [initialBooking])

  // Real-time queue subscription
  useEffect(() => {
    const targetId = bookingId || initialBooking?.bookingId
    if (!targetId) return

    const unsubscribe = api.queue.subscribeQueue(targetId, (updated) => {
      if (updated) {
        setLiveBooking(updated)
        // Automatically open transfer sheet if an active offer arrived
        if (updated.transferOffer) {
          setIsTransferSheetOpen(true)
        }
        // Automatically open review sheet if service completed
        if (updated.status === "completed" && !updated.rating) {
          setIsReviewOpen(true)
        }
      }
    })

    return () => unsubscribe()
  }, [api, bookingId, initialBooking?.bookingId])

  const booking = liveBooking || initialBooking

  // Remove companion
  const handleRemoveCompanion = async (companionId: string) => {
    if (!booking) return
    const res = await api.queue.removeMissingCompanion(booking.bookingId, companionId)
    if (res.success) {
      showSnackbar({
        title: t("Companion removed successfully"),
        description: `${t("Instant refund of")} ${res.refundAmount} ${t("LYD")} ${t("without recording a no-show on account.")}`,
        type: "success",
      })
    } else {
      showSnackbar({
        title: t("Unable to remove companion"),
        description: res.error,
        type: "error",
      })
    }
  }

  // Confirm chair presence via QR
  const handleScanSuccess = async (attendingIds: string[]) => {
    if (!booking) return
    setIsQrModalOpen(false)

    const res = await api.queue.confirmAttendance(booking.bookingId, attendingIds)
    if (res.success) {
      showSnackbar({
        title: t("Chair verified successfully!"),
        description: t("Grooming session in progress"),
        type: "success",
      })
    }
  }

  // Accept chair transfer offer
  const handleAcceptTransfer = async () => {
    if (!booking) return
    setIsTransferSubmitting(true)
    try {
      const res = await api.queue.respondToTransferOffer(booking.bookingId, true)
      setIsTransferSheetOpen(false)
      if (res.success) {
        showSnackbar({
          title: t("Instant Chair Transfer Offer!"),
          description: `${t("Assigned Barber:")} ${res.newStaffName}. ${t("Get ready, you are next in line!")}`,
          type: "success",
        })
      } else {
        showSnackbar({
          title: t("Transfer failed"),
          description: res.error,
          type: "error",
        })
      }
    } finally {
      setIsTransferSubmitting(false)
    }
  }

  // Decline chair transfer offer
  const handleDeclineTransfer = async () => {
    if (!booking) return
    setIsTransferSheetOpen(false)
    await api.queue.respondToTransferOffer(booking.bookingId, false)
  }

  // Submit post-service review
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!booking) return
    setIsReviewSubmitting(true)
    try {
      const res = await api.booking.submitReview(booking.bookingId, rating, comment)
      if (res.success) {
        setIsReviewOpen(false)
        showSnackbar({
          title: t("Thank you for choosing"),
          description: `+${res.earnedPoints} ${t("Loyalty Points")}`,
          type: "success",
        })
      } else {
        showSnackbar({
          title: t("Failed to claim alternative seat"),
          description: res.error,
          type: "error",
        })
      }
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  // Cancellation evaluation
  const handleCancelClick = () => {
    if (!booking) return

    const cancelEval = QueueDomainService.evaluateCustomerCancellation(
      booking.position,
      booking.status
    )

    setCancelReasonMessage(
      cancelEval.canCancelSelf
        ? t("You can cancel directly and refund the balance to your wallet.")
        : t("Your turn is very close or in progress; self-cancellation is locked to protect the barber schedule. Please contact support.")
    )
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!booking) return
    setIsCancelling(true)

    try {
      const res = await api.booking.cancelBooking(booking.bookingId)
      setCancelModalOpen(false)
      if (res.success) {
        showSnackbar({
          title: t("Cancelled"),
          description: res.refunded
            ? t("Amount will be refunded to wallet without no-show penalty")
            : t("Cancelled"),
          type: "info",
        })
        router.replace("/")
      } else {
        showSnackbar({
          title: t("Self-cancellation locked"),
          description: res.reasonMessageAr,
          type: "error",
        })
      }
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCallSupport = () => {
    setCancelModalOpen(false)
    Linking.openURL("tel:+218910000000").catch(() => {
      Alert.alert(t("Technical Support"), t("Customer service and assistance number: 0910000000"))
    })
  }

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1 p-5">
        <View className="flex-row items-center gap-3 mb-6">
          <BackButton />
          <Skeleton width={160} height={22} rounded="md" />
        </View>
        <Skeleton width="100%" height={160} rounded="3xl" className="mb-4" />
        <Skeleton width="100%" height={120} rounded="2xl" className="mb-4" />
        <Skeleton width="100%" height={180} rounded="2xl" />
      </SafeAreaView>
    )
  }

  const isCompleted = booking.status === "completed"
  const isInChair = booking.status === "in_progress"
  const isNextUp = booking.status === "next_up" || booking.position === 1
  const isCloseTurn = booking.position <= 2 || isNextUp || isInChair

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <View>
            <Text style={{ color: colors.text }} className="text-base font-extrabold">
              {t("Live Queue")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              {booking.shopName}
            </Text>
          </View>
        </View>

        <Badge
          variant={
            isCompleted
              ? "success"
              : isInChair
              ? "success"
              : isNextUp
              ? "gold"
              : "default"
          }
          label={
            isCompleted
              ? t("Service completed")
              : isInChair
              ? t("In Chair")
              : isNextUp
              ? t("Next Up")
              : t("In Queue")
          }
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} className="flex-1">
        {/* Main Queue Progress Card */}
        <Card variant="elevated" className="p-5 border border-border-light dark:border-border-dark mb-4">
          <View className="items-center py-2">
            {/* Position Circle */}
            <View
              style={{
                backgroundColor: isCompleted
                  ? "#10b981"
                  : isInChair
                  ? "#10b981"
                  : colors.gold,
                shadowColor: colors.gold,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
              }}
              className="w-24 h-24 rounded-full items-center justify-center mb-3"
            >
              <Text className="text-white text-3xl font-extrabold font-mono">
                {isCompleted ? "✓" : `#${booking.position}`}
              </Text>
              <Text className="text-white/80 text-2xs font-bold">
                {isCompleted ? t("Completed") : t("Position")}
              </Text>
            </View>

            <Text style={{ color: colors.text }} className="text-lg font-extrabold text-center mb-1">
              {isCompleted
                ? t("Enjoy your grooming! Grooming session is completed")
                : isInChair
                ? t("You are in the chair!")
                : isNextUp
                ? t("Get ready, you are next in line!")
                : `${t("Customers ahead in queue:")} ${booking.totalAhead}`}
            </Text>

            <Text style={{ color: colors.muted }} className="text-xs text-center mb-4">
              {t("Assigned Barber:")} {booking.staffName} • {booking.service}
            </Text>

            {/* Wait Stats Row */}
            <View
              style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
              className="w-full p-3 rounded-2xl border flex-row items-center justify-around"
            >
              <View className="items-center">
                <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
                  {t("Approximate Time")}
                </Text>
                <Text style={{ color: colors.gold }} className="font-extrabold text-sm font-mono">
                  {booking.estimatedWait} {t("Minutes")}
                </Text>
              </View>

              <View style={{ borderColor: colors.border }} className="h-6 border-s" />

              <View className="items-center">
                <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
                  {t("Total Persons")}
                </Text>
                <Text style={{ color: colors.text }} className="font-extrabold text-sm font-mono">
                  {booking.persons.length}
                </Text>
              </View>

              <View style={{ borderColor: colors.border }} className="h-6 border-s" />

              <View className="items-center">
                <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
                  {t("Total Paid")}
                </Text>
                <Text style={{ color: colors.text }} className="font-extrabold text-sm font-mono">
                  {booking.totalPrice} {t("LYD")}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 10-Minute Attendance Countdown Timer Card */}
        {booking.attendanceDeadline && (
          <AttendanceTimerCard attendanceDeadline={booking.attendanceDeadline} />
        )}

        {/* Active Transfer Offer Banner (if pending) */}
        {booking.transferOffer && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsTransferSheetOpen(true)}
            style={{
              backgroundColor: "rgba(232, 114, 42, 0.1)",
              borderColor: colors.gold,
            }}
            className="p-4 rounded-2xl border mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5 flex-1">
              <RTLIcon>
                <IconArrowsExchange size={22} color={colors.gold} />
              </RTLIcon>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  {t("Live chair transfer offer available!")}
                </Text>
                <Text style={{ color: colors.muted }} className="text-2xs">
                  {booking.transferOffer.offeredStaffName} {t("is ready to serve you now.")}
                </Text>
              </View>
            </View>

            <Badge variant="gold" label={t("Open Offer (120s)")} />
          </TouchableOpacity>
        )}

        {/* Companions Management Card (Refund Rule & Separate Paths) */}
        <CompanionsManagementCard
          persons={booking.persons}
          onRemoveCompanion={handleRemoveCompanion}
          disabled={isInChair || isCompleted}
        />

        {/* Chair QR Scan Action Card */}
        {!isInChair && !isCompleted && (
          <Card className="p-4 border border-border-light dark:border-border-dark mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pe-3">
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-1">
                  {t("Attendance Verification via QR")}
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs leading-relaxed">
                  {t("When you arrive at the salon and are invited by the barber, scan the QR code on the chair mirror.")}
                </Text>
              </View>

              <Button
                variant="default"
                size="sm"
                label={t("Scan Mirror QR")}
                onPress={() => setIsQrModalOpen(true)}
              />
            </View>
          </Card>
        )}

        {/* In-Chair or Completed Actions */}
        {isInChair && (
          <Card className="p-4 border border-border-light dark:border-border-dark mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pe-2">
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-0.5">
                  {t("Grooming session in progress")}
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs">
                  {t("You can complete the service and rate to earn loyalty points.")}
                </Text>
              </View>
              <Button
                variant="success"
                size="sm"
                label={t("Complete Service & Rate")}
                onPress={() => setIsReviewOpen(true)}
              />
            </View>
          </Card>
        )}

        {isCompleted && (
          <Card className="p-4 border border-border-light dark:border-border-dark mb-4 items-center">
            <Text style={{ color: colors.text }} className="font-bold text-sm mb-1">
              {t("Grooming Completed")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs text-center mb-3">
              {t("Thank you for choosing")} {booking.shopName}. {t("Rate your experience to claim loyalty reward!")}
            </Text>
            <Button
              variant="default"
              size="default"
              label={t("Rate Experience Now")}
              leftIcon={<IconAward size={16} color="#ffffff" />}
              onPress={() => setIsReviewOpen(true)}
            />
          </Card>
        )}

        {/* Interactive Simulation Controls for Demo */}
        <Card className="p-3.5 border border-border-light dark:border-border-dark mb-4 opacity-80">
          <Text style={{ color: colors.muted }} className="text-2xs font-bold mb-2">
            {t("Live Queue Scenarios Simulation:")}
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              label={t("Chair Transfer Offer (120s)")}
              onPress={async () => {
                if ("triggerTransferOffer" in api.queue) {
                  await (api.queue as any).triggerTransferOffer(booking.bookingId)
                  setIsTransferSheetOpen(true)
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              label={t("Advance Queue One Step")}
              onPress={async () => {
                if ("advanceQueue" in api.queue) {
                  await (api.queue as any).advanceQueue(booking.bookingId)
                }
              }}
            />
          </View>
        </Card>

        {/* Cancellation Notice */}
        {!isCompleted && (
          <View className="items-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              label={t("Cancel Booking")}
              onPress={handleCancelClick}
            />
          </View>
        )}
      </ScrollView>

      {/* QR Scanner Modal (Mirror QR Code) */}
      <QrScanModal
        visible={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        barberName={booking.staffName}
        persons={booking.persons}
        onScanSuccess={handleScanSuccess}
      />

      {/* 120-Second Barber Chair Transfer Offer Sheet */}
      <TransferOfferSheet
        visible={isTransferSheetOpen}
        offer={booking.transferOffer}
        onAccept={handleAcceptTransfer}
        onDecline={handleDeclineTransfer}
        loading={isTransferSubmitting}
      />

      {/* Post-Completion Review Sheet */}
      <ReviewSheet
        visible={isReviewOpen}
        shopName={booking.shopName}
        barberName={booking.staffName}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleReviewSubmit}
        loading={isReviewSubmitting}
      />

      {/* Cancel Confirmation / Lock Sheet */}
      <BottomSheet
        visible={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={isCloseTurn ? t("Self-cancellation locked") : t("Confirm Booking Cancellation")}
      >
        <View className="gap-4 pb-4">
          <View
            style={{
              backgroundColor: isCloseTurn ? "rgba(239, 68, 68, 0.08)" : colors.cardAlt,
              borderColor: isCloseTurn ? "rgba(239, 68, 68, 0.3)" : colors.border,
            }}
            className="p-4 rounded-2xl border"
          >
            <View className="flex-row items-start gap-2.5">
              <IconAlertTriangle
                size={20}
                color={isCloseTurn ? "#ef4444" : colors.gold}
                className="mt-0.5"
              />
              <Text style={{ color: colors.text }} className="text-xs flex-1 leading-relaxed">
                {cancelReasonMessage}
              </Text>
            </View>
          </View>

          {isCloseTurn ? (
            <View className="gap-2">
              <Button
                label={t("Call Support")}
                variant="default"
                leftIcon={<IconPhoneCall size={18} color="#ffffff" />}
                onPress={handleCallSupport}
                fullWidth
              />
              <Button
                label={t("Understood, Back to Screen")}
                variant="outline"
                onPress={() => setCancelModalOpen(false)}
                fullWidth
              />
            </View>
          ) : (
            <View className="gap-2">
              <Button
                label={t("Yes, Confirm Cancellation & Refund")}
                variant="danger"
                loading={isCancelling}
                onPress={handleConfirmCancel}
                fullWidth
              />
              <Button
                label={t("Go Back & Keep Place")}
                variant="outline"
                onPress={() => setCancelModalOpen(false)}
                fullWidth
              />
            </View>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  )
}
