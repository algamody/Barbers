import React, { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/components/ui/button"
import { IconCheck, IconCreditCard } from "@tabler/icons-react-native"

interface TopUpModalProps {
  visible: boolean
  onClose: () => void
  onConfirmTopUp: (amount: number, provider: "onepay" | "lypay") => Promise<void>
}

const AMOUNTS = [10, 25, 50, 100]

export function TopUpModal({
  visible,
  onClose,
  onConfirmTopUp,
}: TopUpModalProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const [selectedAmount, setSelectedAmount] = useState<number>(25)
  const [selectedProvider, setSelectedProvider] = useState<"onepay" | "lypay">("onepay")
  const [loading, setLoading] = useState(false)

  const handleTopUp = async () => {
    setLoading(true)
    try {
      await onConfirmTopUp(selectedAmount, selectedProvider)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("Top Up")}>
      <View className="gap-4 pb-4">
        {/* Preset Amounts */}
        <Text style={{ color: colors.text }} className="text-xs font-bold">
          {t("Choose top-up amount (LYD):")}
        </Text>
        <View className="flex-row gap-2">
          {AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt
            return (
              <Pressable
                key={amt}
                onPress={() => setSelectedAmount(amt)}
                className="flex-1 active:opacity-80"
              >
                <Card
                  variant={isSelected ? "elevated" : "default"}
                  className={cn(
                    "p-3 items-center justify-center border",
                    isSelected ? "border-gold bg-gold/10" : "border-border-light dark:border-border-dark"
                  )}
                >
                  <Text
                    style={{ color: isSelected ? colors.gold : colors.text }}
                    className="font-extrabold text-sm font-mono"
                  >
                    {amt} {t("LYD")}
                  </Text>
                </Card>
              </Pressable>
            )
          })}
        </View>

        {/* Payment Gateways */}
        <Text style={{ color: colors.text }} className="text-xs font-bold mt-2">
          {t("Libyan Electronic Payment Gateways:")}
        </Text>
        <View className="gap-2">
          {/* OnePay */}
          <Pressable
            onPress={() => setSelectedProvider("onepay")}
            className="active:opacity-85"
          >
            <Card
              variant={selectedProvider === "onepay" ? "elevated" : "default"}
              className={cn(
                "p-3.5 border flex-row items-center justify-between",
                selectedProvider === "onepay" ? "border-gold" : "border-border-light dark:border-border-dark"
              )}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-blue-500/10 items-center justify-center">
                  <IconCreditCard size={18} color="#3b82f6" />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-bold text-xs">
                    OnePay
                  </Text>
                  <Text style={{ color: colors.muted }} className="text-2xs">
                    {t("Instant top up with local debit cards")}
                  </Text>
                </View>
              </View>

              {selectedProvider === "onepay" && (
                <View
                  style={{ backgroundColor: colors.gold }}
                  className="w-5 h-5 rounded-full items-center justify-center"
                >
                  <IconCheck size={12} color="#ffffff" strokeWidth={3} />
                </View>
              )}
            </Card>
          </Pressable>

          {/* LYPay */}
          <Pressable
            onPress={() => setSelectedProvider("lypay")}
            className="active:opacity-85"
          >
            <Card
              variant={selectedProvider === "lypay" ? "elevated" : "default"}
              className={cn(
                "p-3.5 border flex-row items-center justify-between",
                selectedProvider === "lypay" ? "border-gold" : "border-border-light dark:border-border-dark"
              )}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <IconCreditCard size={18} color="#10b981" />
                </View>
                <View>
                  <Text style={{ color: colors.text }} className="font-bold text-xs">
                    LYPay
                  </Text>
                  <Text style={{ color: colors.muted }} className="text-2xs">
                    {t("Secure payment via electronic wallets")}
                  </Text>
                </View>
              </View>

              {selectedProvider === "lypay" && (
                <View
                  style={{ backgroundColor: colors.gold }}
                  className="w-5 h-5 rounded-full items-center justify-center"
                >
                  <IconCheck size={12} color="#ffffff" strokeWidth={3} />
                </View>
              )}
            </Card>
          </Pressable>
        </View>

        <Button
          label={`${t("Confirm Top Up")} (${selectedAmount} ${t("LYD")})`}
          loading={loading}
          onPress={handleTopUp}
          fullWidth
          className="mt-3"
        />
      </View>
    </BottomSheet>
  )
}
