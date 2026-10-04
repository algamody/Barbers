import React from "react"
import { View, Text, Pressable } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TPersonBooking, TService, TAddon, TRewardItem, TWalletState } from "@/typings"
import { BookingDomainService } from "@/services/domain/booking.domain"
import {
  IconWallet,
  IconCash,
  IconTicket,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react-native"
import { cn } from "@/components/ui/button"

interface ConfirmStepProps {
  persons: TPersonBooking[]
  services: TService[]
  addons: TAddon[]
  wallet: TWalletState | null
  rewards: TRewardItem[]
  selectedRewardId: string | null
  paymentMethod: "wallet" | "cash"
  onSelectPayment: (method: "wallet" | "cash") => void
  onSelectReward: (rewardId: string | null) => void
}

export function ConfirmStep({
  persons,
  services,
  addons,
  wallet,
  rewards,
  selectedRewardId,
  paymentMethod,
  onSelectPayment,
  onSelectReward,
}: ConfirmStepProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  // Calculate gross total
  const subtotal = persons.reduce((sum, p) => {
    const s = services.find((srv) => srv.id === p.serviceId) || services[0]
    const chosenAddons = addons.filter((a) => p.addonIds.includes(a.id))
    return sum + BookingDomainService.calculatePersonPrice(s, chosenAddons)
  }, 0)

  // Apply discount if reward is chosen
  const activeReward = rewards.find((r) => r.id === selectedRewardId)
  const { finalPrice, discountAmount } = activeReward
    ? BookingDomainService.applyDiscount(subtotal, activeReward)
    : { finalPrice: subtotal, discountAmount: 0 }

  const isCashBanned = wallet?.isCashBanned ?? false
  const hasInsufficientWalletBalance = (wallet?.balance ?? 0) < finalPrice

  return (
    <View className="gap-5">
      {/* Order Summary */}
      <Card className="p-4 border border-border-light dark:border-border-dark">
        <Text style={{ color: colors.text }} className="font-bold text-sm mb-3">
          {t("Booking Summary")} ({persons.length})
        </Text>

        <View className="gap-2 pb-3 border-b border-border-light dark:border-border-dark">
          {persons.map((person) => {
            const s = services.find((srv) => srv.id === person.serviceId) || services[0]
            const chosenAddons = addons.filter((a) => pAddonMatch(person.addonIds, a.id))
            const price = BookingDomainService.calculatePersonPrice(s, chosenAddons)

            return (
              <View key={person.id} className="flex-row items-center justify-between">
                <Text style={{ color: colors.muted }} className="text-xs">
                  {person.name}: {s.name}
                  {chosenAddons.length > 0 && ` (+${chosenAddons.length} ${t("Addons")})`}
                </Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  {price} {t("LYD")}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Pricing Totals */}
        <View className="pt-3 gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text style={{ color: colors.muted }} className="text-xs">
              {t("Subtotal")}:
            </Text>
            <Text style={{ color: colors.text }} className="text-xs font-semibold">
              {subtotal} {t("LYD")}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View className="flex-row items-center justify-between">
              <Text style={{ color: "#10b981" }} className="text-xs">
                {t("Reward Discount")}:
              </Text>
              <Text style={{ color: "#10b981" }} className="text-xs font-bold">
                -{discountAmount} {t("LYD")}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between pt-2 border-t border-border-light dark:border-border-dark mt-1">
            <Text style={{ color: colors.text }} className="font-bold text-sm">
              {t("Total Amount")}:
            </Text>
            <Text style={{ color: colors.gold }} className="font-extrabold text-lg">
              {finalPrice} {t("LYD")}
            </Text>
          </View>
        </View>
      </Card>

      {/* Rewards & Coupons */}
      <View className="gap-2.5">
        <View className="flex-row items-center gap-2">
          <IconTicket size={18} color={colors.gold} strokeWidth={2.2} />
          <Text style={{ color: colors.text }} className="font-bold text-sm">
            {t("Apply Loyalty Reward")}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Pressable onPress={() => onSelectReward(null)} className="active:opacity-80">
            <Badge
              variant={selectedRewardId === null ? "gold" : "outline"}
              label={t("No discount")}
            />
          </Pressable>

          {rewards.map((r) => {
            const isSelected = selectedRewardId === r.id
            return (
              <Pressable
                key={r.id}
                onPress={() => onSelectReward(r.id)}
                className="active:opacity-80"
              >
                <Badge
                  variant={isSelected ? "gold" : "secondary"}
                  label={`${r.title} (${r.badge})`}
                />
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* Payment Method Selector */}
      <View className="gap-3">
        <Text style={{ color: colors.text }} className="font-bold text-sm">
          {t("Payment Method")}
        </Text>

        <View className="gap-2.5">
          {/* Wallet Option */}
          <Pressable onPress={() => onSelectPayment("wallet")} className="active:opacity-85">
            <Card
              variant={paymentMethod === "wallet" ? "elevated" : "default"}
              className={cn(
                "p-4 border flex-row items-center justify-between",
                paymentMethod === "wallet" ? "border-gold" : "border-border-light dark:border-border-dark"
              )}
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{ backgroundColor: colors.cardAlt }}
                  className="w-10 h-10 rounded-xl items-center justify-center border border-border-light dark:border-border-dark"
                >
                  <IconWallet size={20} color={colors.gold} />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-bold text-sm">
                    {t("Pay with Wallet")}
                  </Text>
                  <Text style={{ color: colors.muted }} className="text-xs">
                    {t("Current Balance")}: {wallet?.balance ?? 0} {t("LYD")}
                  </Text>
                </View>
              </View>

              {paymentMethod === "wallet" ? (
                <View
                  style={{ backgroundColor: colors.gold }}
                  className="w-5 h-5 rounded-full items-center justify-center"
                >
                  <IconCheck size={12} color="#ffffff" strokeWidth={3} />
                </View>
              ) : (
                <View style={{ borderColor: colors.border }} className="w-5 h-5 rounded-full border" />
              )}
            </Card>
          </Pressable>

          {/* Cash Option */}
          <Pressable
            disabled={isCashBanned}
            onPress={() => onSelectPayment("cash")}
            className={cn("active:opacity-85", isCashBanned && "opacity-50")}
          >
            <Card
              variant={paymentMethod === "cash" ? "elevated" : "default"}
              className={cn(
                "p-4 border flex-row items-center justify-between",
                paymentMethod === "cash" ? "border-gold" : "border-border-light dark:border-border-dark"
              )}
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{ backgroundColor: colors.cardAlt }}
                  className="w-10 h-10 rounded-xl items-center justify-center border border-border-light dark:border-border-dark"
                >
                  <IconCash size={20} color={colors.muted} />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-bold text-sm">
                    {t("Pay with Cash")}
                  </Text>
                  <Text style={{ color: colors.muted }} className="text-xs">
                    {t("Pay cash upon arrival at the salon")}
                  </Text>
                </View>
              </View>

              {!isCashBanned && (
                paymentMethod === "cash" ? (
                  <View
                    style={{ backgroundColor: colors.gold }}
                    className="w-5 h-5 rounded-full items-center justify-center"
                  >
                    <IconCheck size={12} color="#ffffff" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={{ borderColor: colors.border }} className="w-5 h-5 rounded-full border" />
                )
              )}
            </Card>
          </Pressable>
        </View>

        {/* Rule Alert: Cash Payment Ban */}
        {isCashBanned && (
          <View
            style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.3)" }}
            className="p-3.5 rounded-2xl border flex-row items-start gap-2.5 mt-1"
          >
            <IconAlertTriangle size={18} color="#ef4444" className="mt-0.5" />
            <View className="flex-1">
              <Text style={{ color: "#ef4444" }} className="font-bold text-xs">
                {t("Cash payment locked")}
              </Text>
              <Text style={{ color: colors.muted }} className="text-2xs leading-relaxed mt-0.5">
                {t("Cash payment is restricted due to a previous no-show")}
              </Text>
            </View>
          </View>
        )}

        {/* Wallet Insufficient Warning */}
        {paymentMethod === "wallet" && hasInsufficientWalletBalance && (
          <View
            style={{ backgroundColor: "rgba(234, 179, 8, 0.08)", borderColor: "rgba(234, 179, 8, 0.3)" }}
            className="p-3 rounded-2xl border flex-row items-center gap-2 mt-1"
          >
            <IconAlertTriangle size={16} color="#eab308" />
            <Text style={{ color: colors.text }} className="text-xs flex-1">
              {t("Insufficient wallet balance. Please top up your wallet.")}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

function pAddonMatch(addonIds: string[], id: string): boolean {
  return addonIds.includes(id)
}
