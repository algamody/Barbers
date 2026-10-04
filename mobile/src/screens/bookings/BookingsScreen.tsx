import React, { useMemo } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/ui/rating"
import { Skeleton } from "@/components/feedback/skeleton"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/feedback/empty-state"
import {
  IconCalendarEvent,
  IconTicket,
  IconArrowRight,
  IconRotateClockwise,
  IconScissors,
} from "@tabler/icons-react-native"

export default function BookingsScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const pastBookings = useMemo(
    () => [
      {
        id: "hist-1",
        shopId: "royal-cut",
        shopName: t("Royal Cut Salon"),
        service: t("Full Package (Hair + Beard)"),
        staffName: t("Tarek El-Majbri"),
        date: t("12 Sep 2026"),
        price: 22,
        rating: 5,
      },
      {
        id: "hist-2",
        shopId: "barber-king",
        shopName: t("Royal Elegance Salon"),
        service: t("Classic Haircut"),
        staffName: t("Karim El-Fitouri"),
        date: t("28 Aug 2026"),
        price: 15,
        rating: 4.5,
      },
    ],
    [t]
  )

  // Query active booking via use() hook
  const activeBookingRequest = useMemo(() => api.booking.getActiveBooking(), [api])
  const { data: activeBooking, isLoading } = use(activeBookingRequest)

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text style={{ color: colors.text }} className="text-base font-extrabold">
            {t("My Bookings")}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} className="flex-1">
        {/* Active Booking Section */}
        <Text style={{ color: colors.text }} className="font-extrabold text-sm mb-3">
          {t("Active Booking")}
        </Text>

        {isLoading ? (
          <Skeleton height={140} rounded="2xl" className="mb-6" />
        ) : activeBooking ? (
          <Card
            variant="elevated"
            className="p-4 border border-border-light dark:border-border-dark mb-6"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <IconTicket size={18} color={colors.gold} strokeWidth={2.2} />
                <Text style={{ color: colors.text }} className="font-bold text-sm">
                  {activeBooking.shopName}
                </Text>
              </View>

              <Badge
                variant={activeBooking.position === 1 ? "success" : "gold"}
                label={`${t("Position in Queue")}: #${activeBooking.position}`}
              />
            </View>

            <Text style={{ color: colors.muted }} className="text-xs mb-3">
              {t("Barber")}: {activeBooking.staffName} • {activeBooking.service}
            </Text>

            <View className="flex-row items-center justify-between pt-2 border-t border-border-light dark:border-border-dark mb-3">
              <Text style={{ color: colors.muted }} className="text-2xs">
                {t("Waiting Customers")}: {activeBooking.totalAhead}
              </Text>
              <Text style={{ color: colors.gold }} className="text-xs font-bold font-mono">
                {t("Estimated Wait")}: {activeBooking.estimatedWait} {t("min")}
              </Text>
            </View>

            <Button
              variant="default"
              size="sm"
              label={t("View Live Queue")}
              onPress={() =>
                router.push({
                  pathname: "/queue/[bookingId]",
                  params: { bookingId: activeBooking.bookingId },
                })
              }
              fullWidth
            />
          </Card>
        ) : (
          <Card className="p-4 border border-border-light dark:border-border-dark mb-6 items-center">
            <Text style={{ color: colors.muted }} className="text-xs">
              {t("No active booking in progress")}
            </Text>
          </Card>
        )}

        {/* Past Completed Bookings History */}
        <Text style={{ color: colors.text }} className="font-extrabold text-sm mb-3">
          {t("Past Bookings History")}
        </Text>

        <View className="gap-3">
          {pastBookings.map((hist) => (
            <Card key={hist.id} className="p-4 border border-border-light dark:border-border-dark">
              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ color: colors.text }} className="font-bold text-sm">
                  {hist.shopName}
                </Text>
                <Text style={{ color: colors.gold }} className="font-extrabold text-sm font-mono">
                  {hist.price} {t("LYD")}
                </Text>
              </View>

              <Text style={{ color: colors.muted }} className="text-xs mb-2">
                {hist.service} • {t("Barber")}: {hist.staffName} • {hist.date}
              </Text>

              <View className="flex-row items-center justify-between pt-2.5 border-t border-border-light dark:border-border-dark">
                <Rating value={hist.rating} size={12} showValue />

                <Button
                  variant="outline"
                  size="sm"
                  label={t("Re-book")}
                  icon={<IconRotateClockwise size={13} color={colors.gold} />}
                  onPress={() =>
                    router.push({
                      pathname: "/booking/[shopId]",
                      params: { shopId: hist.shopId },
                    })
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
