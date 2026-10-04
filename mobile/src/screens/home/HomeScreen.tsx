import React, { useState, useMemo } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import { Rating } from "@/components/ui/rating"
import { StatusChip } from "@/components/ui/status-chip"
import { BackButton } from "@/components/ui/back-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CopyButton } from "@/components/ui/copy-button"
import { Skeleton } from "@/components/feedback/skeleton"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/feedback/empty-state"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { showSnackbar } from "@/components/feedback/snackbar"
import { useCountdown } from "@/hooks/useCountdown"
import {
  IconScissors,
  IconSun,
  IconMoon,
  IconWorld,
  IconClock,
  IconBell,
  IconCalendarEvent,
  IconSparkles,
  IconWallet,
  IconUsers,
  IconUserMinus,
  IconRefresh,
  IconMapPin,
  IconTicket,
  IconUser,
} from "@tabler/icons-react-native"

// Fixed 10-minute deadline for demo
const DEMO_DEADLINE = Date.now() + 600 * 1000

export default function HomeScreen() {
  const router = useRouter()
  const { theme, colors, toggleTheme } = useAppTheme()
  const { lang, setLanguage, t } = useAppLanguage()
  const api = useApi()

  // State for interactive showcase
  const [activeTab, setActiveTab] = useState<string>("services")
  const [inputText, setInputText] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)

  // Countdown hook with fixed server deadline
  const countdown = useCountdown(DEMO_DEADLINE)

  // Remote data consumption strictly via custom use() hook adhering to architecture
  const shopsRequest = useMemo(() => api.shop.getShops(), [api])
  const { data: shops, isLoading: shopsLoading, refetch: refetchShops } = use(shopsRequest)

  const bookingRequest = useMemo(() => api.booking.getActiveBooking(), [api])
  const {
    data: activeBooking,
    isLoading: bookingLoading,
    refetch: refetchBooking,
  } = use(bookingRequest)

  const walletRequest = useMemo(() => api.wallet.getWalletState(), [api])
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = use(walletRequest)

  const isDark = theme === "dark"

  const handleTestButton = () => {
    setBtnLoading(true)
    setTimeout(() => {
      setBtnLoading(false)
      showSnackbar({
        title: t("Operation called successfully!"),
        description: t("Floating Snackbar component works smoothly with NativeWind."),
        type: "success",
      })
    }, 1200)
  }

  // Interactive Phase 3 actions
  const handleTopUp = async (amount: number) => {
    const res = await api.wallet.topUp(amount, "onepay")
    if (res.success) {
      await refetchWallet()
      showSnackbar({
        title: `${t("Top Up")} ${amount} ${t("LYD")} ${t("Top Up Successful!")}`,
        description: `${t("New Balance:")} ${res.newBalance} ${t("LYD")}`,
        type: "success",
      })
    }
  }

  const handleRemoveCompanion = async (companionId: string) => {
    if (!activeBooking) return
    const res = await api.queue.removeMissingCompanion(
      activeBooking.bookingId,
      companionId
    )
    if (res.success) {
      await refetchBooking()
      showSnackbar({
        title: t("Companion removed successfully"),
        description: `${t("Instant refund of")} ${res.refundAmount} ${t("LYD")} ${t("without recording a no-show on account.")}`,
        type: "info",
      })
    } else {
      showSnackbar({
        title: t("Unable to remove companion"),
        description: res.error,
        type: "error",
      })
    }
  }

  const handleClaimAlternativeSlot = async (shopId: string, staffId: string) => {
    const res = await api.queue.claimAlternativeSlot(shopId, staffId)
    if (res.success) {
      await refetchBooking()
      await refetchShops()
      showSnackbar({
        title: t("Alternative seat claimed successfully!"),
        description: t("Priority fee (5 LYD) paid, you are now at the top of the queue."),
        type: "success",
      })
    } else {
      showSnackbar({
        title: t("Failed to claim alternative seat"),
        description: res.error,
        type: "error",
      })
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1">
        {/* Header Bar */}
        <View className="flex-row items-center justify-between mb-6">
          <BackButton />

          <View className="flex-row items-center gap-2">
            <View
              style={{ backgroundColor: colors.gold }}
              className="w-9 h-9 rounded-xl items-center justify-center shadow-sm"
            >
              <IconScissors size={20} color="#ffffff" strokeWidth={2.2} />
            </View>
            <Text style={{ color: colors.text }} className="text-xl font-extrabold tracking-wider">
              {t("Barbers")}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onPress={toggleTheme}
              accessibilityLabel={t("Toggle Theme")}
            >
              {isDark ? (
                <IconSun size={18} color={colors.gold} strokeWidth={2} />
              ) : (
                <IconMoon size={18} color={colors.gold} strokeWidth={2} />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onPress={() => setLanguage(lang === "ar" ? "en" : "ar")}
              accessibilityLabel={t("Switch Language")}
            >
              <IconWorld size={18} color={colors.gold} strokeWidth={2} />
            </Button>
          </View>
        </View>

        {/* Quick App Navigation Bar */}
        <View className="flex-row gap-2 mb-4 overflow-x-scroll">
          <Button
            variant="default"
            size="sm"
            label={t("My Bookings")}
            icon={<IconCalendarEvent size={14} color="#ffffff" />}
            onPress={() => router.push("/bookings")}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            label={t("Wallet")}
            icon={<IconWallet size={14} color={colors.gold} />}
            onPress={() => router.push("/wallet")}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            label={t("Community Updates")}
            icon={<IconUsers size={14} color={colors.gold} />}
            onPress={() => router.push("/community")}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            label={t("Account")}
            icon={<IconUser size={14} color={colors.gold} />}
            onPress={() => router.push("/profile")}
            className="flex-1"
          />
        </View>

        {/* Complete System Banner */}
        <Card variant="elevated" className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.text }} className="text-base font-bold">
              {t("Barbers App (100% Integrated System)")}
            </Text>
            <Badge variant="success" label={t("Fully Complete")} />
          </View>

          <Text style={{ color: colors.muted }} className="text-xs leading-relaxed mb-4">
            {t("All screens and flows are built: salon details and galleries, individual and group booking flows, live queue with attendance timer and QR scanning, wallet and P2P transfers, crowdsourced community updates with voting, and bookings history with rewards.")}
          </Text>

          {/* Countdown Hook with Fixed Deadline */}
          <View
            style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
            className="p-3.5 rounded-2xl border flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <IconClock size={18} color={colors.gold} strokeWidth={2.2} />
              <Text style={{ color: colors.text }} className="text-xs font-semibold">
                {t("Unified Attendance Timer (Fixed Deadline):")}
              </Text>
            </View>
            <Text style={{ color: colors.gold }} className="text-sm font-extrabold font-mono">
              {countdown.formatted}
            </Text>
          </View>
        </Card>

        {/* Tabs for Showcase Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="services" label={t("Phase 3 Services (Data)")} />
            <TabsTrigger value="primitives" label={t("Atomic Primitives (UI)")} />
            <TabsTrigger value="feedback" label={t("Feedback Primitives")} />
          </TabsList>

          {/* Tab 1: Phase 3 Domain Services & Data */}
          <TabsContent value="services">
            <View className="gap-5">
              {/* Wallet Domain Card */}
              <Card>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <IconWallet size={18} color={colors.gold} strokeWidth={2.2} />
                    <Text style={{ color: colors.text }} className="font-bold text-sm">
                      {t("Digital Wallet (Wallet Domain)")}
                    </Text>
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => refetchWallet()}
                    accessibilityLabel={t("Refresh Wallet")}
                  >
                    <IconRefresh size={14} color={colors.muted} />
                  </Button>
                </View>

                {walletLoading ? (
                  <Skeleton height={60} rounded="xl" />
                ) : (
                  <View className="gap-3">
                    <View
                      style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
                      className="p-3.5 rounded-2xl border flex-row items-center justify-between"
                    >
                      <View>
                        <Text style={{ color: colors.muted }} className="text-xs">
                          {t("Available Balance")}
                        </Text>
                        <Text style={{ color: colors.gold }} className="text-xl font-extrabold">
                          {wallet?.balance ?? 0} {t("LYD")}
                        </Text>
                      </View>
                      <Badge
                        variant={wallet?.isCashBanned ? "danger" : "success"}
                        label={wallet?.isCashBanned ? t("Cash Payment Restricted") : t("Account Active")}
                      />
                    </View>

                    <View className="flex-row gap-2">
                      <Button
                        label={t("Top Up +10 LYD (OnePay)")}
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onPress={() => handleTopUp(10)}
                      />
                      <Button
                        label={t("Top Up +25 LYD (LYPay)")}
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onPress={() => handleTopUp(25)}
                      />
                    </View>
                  </View>
                )}
              </Card>

              {/* Active Queue & Booking Domain Card */}
              <Card>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <IconTicket size={18} color={colors.gold} strokeWidth={2.2} />
                    <Text style={{ color: colors.text }} className="font-bold text-sm">
                      {t("Booking & Live Queue Status")}
                    </Text>
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => refetchBooking()}
                    accessibilityLabel={t("Refresh Booking")}
                  >
                    <IconRefresh size={14} color={colors.muted} />
                  </Button>
                </View>

                {bookingLoading ? (
                  <Skeleton height={90} rounded="xl" />
                ) : activeBooking ? (
                  <View className="gap-3">
                    <View
                      style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
                      className="p-3.5 rounded-2xl border"
                    >
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text style={{ color: colors.text }} className="font-bold text-sm">
                          {activeBooking.shopName}
                        </Text>
                        <Badge
                          variant={activeBooking.position === 1 ? "success" : "gold"}
                          label={`${t("Position")}: #${activeBooking.position}`}
                        />
                      </View>

                      <Text style={{ color: colors.muted }} className="text-xs mb-1">
                        {t("Barber")}: {activeBooking.staffName} • {activeBooking.service}
                      </Text>

                      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border-light dark:border-border-dark">
                        <Text style={{ color: colors.muted }} className="text-xs">
                          {t("Customers waiting ahead")}: {activeBooking.totalAhead}
                        </Text>
                        <Text style={{ color: colors.gold }} className="text-xs font-bold">
                          {t("Estimated remaining")}: {activeBooking.estimatedWait} {t("min")}
                        </Text>
                      </View>
                    </View>

                    {/* Companions List (Refund Rule Showcase) */}
                    <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                      {t("Registered companions in booking:")}
                    </Text>
                    {activeBooking.persons.map((person) => (
                      <View
                        key={person.id}
                        style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
                        className="p-3 rounded-xl border flex-row items-center justify-between"
                      >
                        <View>
                          <Text style={{ color: colors.text }} className="text-xs font-semibold">
                            {person.name} ({person.serviceName})
                          </Text>
                          <Text style={{ color: colors.muted }} className="text-2xs">
                            {t("Price")}: {person.price} {t("LYD")}
                          </Text>
                        </View>

                        {person.isMe ? (
                          <Badge variant="outline" label={t("Primary Account")} />
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            label={t("Remove & Refund")}
                            onPress={() => handleRemoveCompanion(person.id)}
                          />
                        )}
                      </View>
                    ))}

                    <Button
                      variant="default"
                      size="sm"
                      label={t("Open Live Queue Screen")}
                      onPress={() => router.push("/queue")}
                      fullWidth
                      className="mt-2"
                    />
                  </View>
                ) : (
                  <Text style={{ color: colors.muted }} className="text-xs">
                    {t("No active booking currently")}
                  </Text>
                )}
              </Card>

              {/* Salons List & Alternative Slot Claim */}
              <Card>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <IconScissors size={18} color={colors.gold} strokeWidth={2.2} />
                    <Text style={{ color: colors.text }} className="font-bold text-sm">
                      {t("Barbershops & Alternative Slots")}
                    </Text>
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => refetchShops()}
                    accessibilityLabel={t("Refresh Shops")}
                  >
                    <IconRefresh size={14} color={colors.muted} />
                  </Button>
                </View>

                {shopsLoading ? (
                  <View className="gap-2">
                    <Skeleton height={70} rounded="xl" />
                    <Skeleton height={70} rounded="xl" />
                  </View>
                ) : (
                  <View className="gap-3">
                    {shops?.map((shop) => (
                      <View
                        key={shop.id}
                        style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
                        className="p-3.5 rounded-2xl border"
                      >
                        <View className="flex-row items-center justify-between mb-1.5">
                          <Text style={{ color: colors.text }} className="font-bold text-sm">
                            {shop.nameAr}
                          </Text>
                          <Rating value={shop.rating} size={13} showValue />
                        </View>

                        <View className="flex-row items-center gap-1.5 mb-2">
                          <IconMapPin size={13} color={colors.muted} />
                          <Text style={{ color: colors.muted }} className="text-2xs">
                            {shop.address} ({shop.distance})
                          </Text>
                        </View>

                        {/* Check for Barber with Alternative Slot */}
                        {shop.staff.some((st) => st.altBooking) && (
                          <View
                            style={{ backgroundColor: colors.bg, borderColor: colors.gold }}
                            className="p-2.5 rounded-xl border mt-2 flex-row items-center justify-between"
                          >
                            <View className="flex-1 pe-2">
                              <Text style={{ color: colors.gold }} className="text-xs font-bold">
                                {t("Alternative seat available (5 LYD priority)")}
                              </Text>
                              <Text style={{ color: colors.muted }} className="text-2xs">
                                {t("Barber Tariq's chair is available immediately after customer no-show.")}
                              </Text>
                            </View>
                            <Button
                              variant="default"
                              size="sm"
                              label={t("Claim Priority")}
                              onPress={() => handleClaimAlternativeSlot(shop.id, "st1")}
                            />
                          </View>
                        )}

                        {/* Salon Actions */}
                        <View className="flex-row gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            label={t("Salon Details")}
                            onPress={() =>
                              router.push({
                                pathname: "/shop/[id]",
                                params: { id: shop.id },
                              })
                            }
                            className="flex-1"
                          />
                          <Button
                            variant="default"
                            size="sm"
                            label={t("Book Appointment")}
                            onPress={() =>
                              router.push({
                                pathname: "/booking/[shopId]",
                                params: { shopId: shop.id },
                              })
                            }
                            className="flex-1"
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </View>
          </TabsContent>

          {/* Tab 2: Atomic Primitives */}
          <TabsContent value="primitives">
            <View className="gap-5">
              {/* Buttons Section */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("1. Button Variants")}
                </Text>
                <View className="gap-2.5">
                  <Button
                    label={t("Primary Default")}
                    loading={btnLoading}
                    onPress={handleTestButton}
                    fullWidth
                  />
                  <View className="flex-row gap-2">
                    <Button
                      variant="outline"
                      label={t("Outline")}
                      className="flex-1"
                      onPress={() => showSnackbar({ title: t("Outline"), type: "info" })}
                    />
                    <Button
                      variant="secondary"
                      label={t("Secondary")}
                      className="flex-1"
                      onPress={() => showSnackbar({ title: t("Secondary"), type: "info" })}
                    />
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      variant="danger"
                      label={t("Cancel (Danger)")}
                      className="flex-1"
                      size="sm"
                      onPress={() => showSnackbar({ title: t("Cancelled"), type: "error" })}
                    />
                    <Button
                      variant="success"
                      label={t("Confirm (Success)")}
                      className="flex-1"
                      size="sm"
                      onPress={() => showSnackbar({ title: t("Confirm"), type: "success" })}
                    />
                  </View>
                </View>
              </Card>

              {/* Status Chips & Rating Section */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("2. Status & Rating")}
                </Text>
                <View className="gap-3">
                  <View className="flex-row flex-wrap gap-2">
                    <StatusChip isOpen={true} waitingCount={3} isVerified={true} />
                    <StatusChip isOpen={true} waitingCount={5} isCommunityUpdate={true} />
                    <StatusChip isOpen={false} />
                  </View>
                  <View className="flex-row items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
                    <Text style={{ color: colors.muted }} className="text-xs">
                      {t("Salon Rating:")}
                    </Text>
                    <Rating value={4.8} size={16} showValue />
                  </View>
                </View>
              </Card>

              {/* Badges Section */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("3. Badges")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <Badge variant="gold" label={t("Premium Seat")} />
                  <Badge variant="default" label={t("Default")} />
                  <Badge variant="success" label={t("Completed")} />
                  <Badge variant="danger" label={t("Rejected")} />
                  <Badge variant="gold" label={t("Alert")} />
                  <Badge variant="outline" label={t("Subtle Outline")} />
                </View>
              </Card>

              {/* Inputs & OTP Section */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("4. Inputs & OTP")}
                </Text>
                <View className="gap-3">
                  <Input
                    label={t("Libyan Phone Number")}
                    placeholder="091XXXXXXX"
                    value={inputText}
                    onChangeText={setInputText}
                    helperText={t("Enter phone number to receive haircut reminder notification")}
                  />
                  <View className="pt-2">
                    <Text style={{ color: colors.text }} className="text-xs font-semibold mb-2">
                      {t("Verification Code (4 Digits):")}
                    </Text>
                    <OtpInput
                      length={4}
                      value={otpCode}
                      onChange={setOtpCode}
                      onComplete={(code) =>
                        showSnackbar({
                          title: t("Code Completed!"),
                          description: `${t("Verification Code")}: ${code}`,
                          type: "success",
                        })
                      }
                    />
                  </View>
                </View>
              </Card>

              {/* Copy Button & Action */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("5. Smart Copy Button")}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.muted }} className="text-xs">
                    {t("Wallet ID:")} LY-BARBER-8842
                  </Text>
                  <CopyButton text="LY-BARBER-8842" label={t("Copy ID")} />
                </View>
              </Card>
            </View>
          </TabsContent>

          {/* Tab 3: Feedback Primitives */}
          <TabsContent value="feedback">
            <View className="gap-5">
              {/* Skeleton Loaders */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("1. Skeleton Loaders")}
                </Text>
                <View className="gap-2.5">
                  <Skeleton width="60%" height={16} rounded="md" />
                  <Skeleton width="100%" height={48} rounded="xl" />
                  <View className="flex-row gap-2">
                    <Skeleton width={44} height={44} rounded="full" />
                    <View className="flex-1 gap-1.5 justify-center">
                      <Skeleton width="80%" height={12} rounded="md" />
                      <Skeleton width="45%" height={10} rounded="md" />
                    </View>
                  </View>
                </View>
              </Card>

              {/* Empty State */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("2. Empty State")}
                </Text>
                <EmptyState>
                  <EmptyStateIcon>
                    <IconCalendarEvent size={36} color={colors.gold} strokeWidth={1.5} />
                  </EmptyStateIcon>
                  <EmptyStateTitle>{t("No past bookings")}</EmptyStateTitle>
                  <EmptyStateDescription>
                    {t("You haven't made any bookings yet. Start now by selecting your favorite salon and book your appointment easily.")}
                  </EmptyStateDescription>
                  <EmptyStateAction>
                    <Button
                      size="sm"
                      label={t("Explore Nearby Salons")}
                      onPress={() => showSnackbar({ title: t("Salon Details"), type: "info" })}
                    />
                  </EmptyStateAction>
                </EmptyState>
              </Card>

              {/* Bottom Sheet Trigger */}
              <Card>
                <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
                  {t("3. Bottom Sheet")}
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs mb-3">
                  {t("Native smooth slide-up bottom sheet component.")}
                </Text>
                <Button
                  label={t("Open Alternative Seat Details")}
                  variant="outline"
                  onPress={() => setIsSheetOpen(true)}
                  fullWidth
                />
              </Card>
            </View>
          </TabsContent>
        </Tabs>

        {/* Interactive Bottom Sheet */}
        <BottomSheet
          visible={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title={t("Available Alternative Booking Details")}
        >
          <View className="gap-4">
            <View
              style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
              className="p-4 rounded-2xl border"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ color: colors.text }} className="font-bold text-sm">
                  {t("Barber Chair: Mohamed Alzway")}
                </Text>
                <Badge variant="gold" label={t("5 LYD Priority")} />
              </View>
              <Text style={{ color: colors.muted }} className="text-xs leading-relaxed">
                {t("The original customer did not show up; you can claim the seat and scan the QR code to take the chair immediately.")}
              </Text>
            </View>

            <Button
              label={t("Confirm & Scan Barber QR")}
              onPress={() => {
                setIsSheetOpen(false)
                showSnackbar({
                  title: t("Alternative seat claimed successfully!"),
                  type: "success",
                })
              }}
              fullWidth
            />
          </View>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  )
}
