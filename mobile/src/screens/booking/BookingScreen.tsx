import React, { useState, useMemo, useEffect } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/feedback/skeleton"
import { showSnackbar } from "@/components/feedback/snackbar"
import { ServicesStep } from "./components/ServicesStep"
import { BarberStep } from "./components/BarberStep"
import { GroupStep } from "./components/GroupStep"
import { ConfirmStep } from "./components/ConfirmStep"
import type { TDraftBooking, TPersonBooking } from "@/typings"

type BookingStep = "services" | "barber" | "group" | "confirm"

const STEPS: BookingStep[] = ["services", "barber", "group", "confirm"]

export default function BookingScreen() {
  const router = useRouter()
  const { shopId } = useLocalSearchParams<{ shopId?: string }>()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  // Remote queries via use() hook
  const shopRequest = useMemo(
    () => (shopId ? api.shop.getShopById(shopId) : api.shop.getShops().then((s) => s[0])),
    [api, shopId]
  )
  const { data: shop, isLoading: shopLoading } = use(shopRequest)

  const walletRequest = useMemo(() => api.wallet.getWalletState(), [api])
  const { data: wallet } = use(walletRequest)

  const rewardsRequest = useMemo(() => api.user.getRewards(), [api])
  const { data: rewards } = use(rewardsRequest)

  // Booking draft state
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [persons, setPersons] = useState<TPersonBooking[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash">("wallet")
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize primary person when shop is loaded
  useEffect(() => {
    if (shop && shop.services.length > 0) {
      const defaultService = shop.services[0]
      setSelectedServiceId(defaultService.id)
      setPersons([
        {
          id: "me",
          name: t("Me"),
          isMe: true,
          serviceId: defaultService.id,
          addonIds: [],
          staffId: null,
        },
      ])
    }
  }, [shop])

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    )

    // Update primary person's addons
    setPersons((prev) =>
      prev.map((p) => (p.isMe ? { ...p, addonIds: p.addonIds.includes(addonId) ? p.addonIds.filter(id => id !== addonId) : [...p.addonIds, addonId] } : p))
    )
  }

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setPersons((prev) =>
      prev.map((p) => (p.isMe ? { ...p, serviceId } : p))
    )
  }

  const handleSelectStaff = (staffId: string | null) => {
    setSelectedStaffId(staffId)
    setPersons((prev) =>
      prev.map((p) => (p.isMe ? { ...p, staffId } : p))
    )
  }

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleConfirmBooking = async () => {
    if (!shop) return
    setIsSubmitting(true)

    const draft: TDraftBooking = {
      shopId: shop.id,
      serviceId: selectedServiceId,
      addonIds: selectedAddonIds,
      persons,
      step: "confirm",
      selectedStaff: selectedStaffId,
      payment: paymentMethod,
      updatedAt: Date.now(),
    }

    try {
      const result = await api.booking.createBooking(draft)
      if (result.success) {
        showSnackbar({
          title: t("Booking confirmed successfully!"),
          description: t("Your spot in the live queue is reserved."),
          type: "success",
        })
        router.replace({
          pathname: "/queue/[bookingId]",
          params: { bookingId: result.bookingId },
        })
      } else {
        showSnackbar({
          title: t("Unable to complete booking"),
          description: result.error || t("Please try again"),
          type: "error",
        })
      }
    } catch {
      showSnackbar({
        title: t("Connection error"),
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (shopLoading || !shop) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1 p-5">
        <View className="flex-row items-center gap-3 mb-6">
          <BackButton />
          <Skeleton width={140} height={20} rounded="md" />
        </View>
        <Skeleton width="100%" height={120} rounded="2xl" className="mb-4" />
        <Skeleton width="100%" height={240} rounded="2xl" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top App Bar */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton onPress={currentStepIndex > 0 ? handlePrev : undefined} />
          <View>
            <Text style={{ color: colors.text }} className="text-base font-extrabold">
              {t("New Booking")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              {shop.nameAr}
            </Text>
          </View>
        </View>

        {/* Step Indicator */}
        <View className="flex-row items-center gap-1.5">
          {STEPS.map((_, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor:
                  idx === currentStepIndex
                    ? colors.gold
                    : idx < currentStepIndex
                    ? colors.text
                    : colors.border,
              }}
              className="w-5 h-1.5 rounded-full"
            />
          ))}
        </View>
      </View>

      {/* Step Content */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} className="flex-1">
        {currentStep === "services" && (
          <ServicesStep
            services={shop.services}
            addons={shop.addons}
            selectedServiceId={selectedServiceId}
            selectedAddonIds={selectedAddonIds}
            onSelectService={handleSelectService}
            onToggleAddon={handleToggleAddon}
          />
        )}

        {currentStep === "barber" && (
          <BarberStep
            staff={shop.staff}
            selectedStaffId={selectedStaffId}
            onSelectStaff={handleSelectStaff}
          />
        )}

        {currentStep === "group" && (
          <GroupStep
            services={shop.services}
            staff={shop.staff}
            addons={shop.addons}
            persons={persons}
            onUpdatePersons={setPersons}
          />
        )}

        {currentStep === "confirm" && (
          <ConfirmStep
            persons={persons}
            services={shop.services}
            addons={shop.addons}
            wallet={wallet}
            rewards={rewards || []}
            selectedRewardId={selectedRewardId}
            paymentMethod={paymentMethod}
            onSelectPayment={setPaymentMethod}
            onSelectReward={setSelectedRewardId}
          />
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
        className="absolute bottom-0 start-0 end-0 p-4 border-t flex-row items-center gap-3 shadow-lg"
      >
        {currentStepIndex > 0 && (
          <Button
            variant="outline"
            label={t("Back")}
            onPress={handlePrev}
            className="flex-1"
          />
        )}

        {currentStepIndex < STEPS.length - 1 ? (
          <Button
            label={t("Continue")}
            onPress={handleNext}
            className="flex-2"
          />
        ) : (
          <Button
            label={t("Confirm & Join Queue")}
            loading={isSubmitting}
            onPress={handleConfirmBooking}
            className="flex-2"
          />
        )}
      </View>
    </SafeAreaView>
  )
}
