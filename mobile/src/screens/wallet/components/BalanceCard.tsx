import React from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { RTLIcon } from "@/components/ui/rtl-icon"
import type { TWalletState } from "@/typings"
import { IconWallet, IconArrowUpRight, IconPlus, IconAlertTriangle } from "@tabler/icons-react-native"

interface BalanceCardProps {
  wallet: TWalletState
  onOpenTopUp: () => void
  onOpenTransfer: () => void
}

export function BalanceCard({
  wallet,
  onOpenTopUp,
  onOpenTransfer,
}: BalanceCardProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  return (
    <Card
      variant="elevated"
      className="p-5 border border-border-light dark:border-border-dark mb-4"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View
            style={{ backgroundColor: colors.gold }}
            className="w-10 h-10 rounded-2xl items-center justify-center shadow-xs"
          >
            <IconWallet size={20} color="#ffffff" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={{ color: colors.text }} className="font-extrabold text-sm">
              {t("Wallet")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {t("Direct payment & booking wallet")}
            </Text>
          </View>
        </View>

        <Badge
          variant={wallet.isCashBanned ? "danger" : "success"}
          label={wallet.isCashBanned ? t("Cash Payment Locked") : t("Account Active")}
        />
      </View>

      {/* Balance Display */}
      <View className="mb-4">
        <Text style={{ color: colors.muted }} className="text-xs mb-1">
          {t("Current Balance")}
        </Text>
        <View className="flex-row items-baseline gap-2">
          <Text style={{ color: colors.gold }} className="text-3xl font-extrabold font-mono">
            {wallet.balance.toFixed(2)}
          </Text>
          <Text style={{ color: colors.text }} className="text-sm font-bold">
            {t("LYD")}
          </Text>
        </View>
      </View>

      {/* Wallet ID & Copy */}
      <View
        style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
        className="p-3 rounded-xl border flex-row items-center justify-between mb-4"
      >
        <View>
          <Text style={{ color: colors.muted }} className="text-2xs mb-0.5">
            {t("Wallet ID for P2P transfers:")}
          </Text>
          <Text style={{ color: colors.text }} className="text-xs font-mono font-bold">
            {wallet.walletId}
          </Text>
        </View>
        <CopyButton text={wallet.walletId} label={t("Copy")} />
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2.5">
        <Button
          variant="default"
          label={t("Top Up")}
          icon={<IconPlus size={16} color="#ffffff" />}
          onPress={onOpenTopUp}
          className="flex-1"
        />
        <Button
          variant="outline"
          label={t("P2P Transfer")}
          icon={
            <RTLIcon>
              <IconArrowUpRight size={16} color={colors.gold} />
            </RTLIcon>
          }
          onPress={onOpenTransfer}
          className="flex-1"
        />
      </View>

      {/* Cash Ban Notice */}
      {wallet.isCashBanned && (
        <View
          style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.3)" }}
          className="p-3 rounded-xl border flex-row items-center gap-2 mt-3"
        >
          <IconAlertTriangle size={16} color="#ef4444" />
          <Text style={{ color: "#ef4444" }} className="text-2xs flex-1 leading-relaxed">
            {t("Cash payment locked due to missed appointments (NO_SHOW_CASH_BAN rule).")}
          </Text>
        </View>
      )}
    </Card>
  )
}
