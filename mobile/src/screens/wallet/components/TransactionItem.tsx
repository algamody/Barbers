import React from "react"
import { View, Text } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RTLIcon } from "@/components/ui/rtl-icon"
import type { TTransaction } from "@/typings"
import { IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react-native"

interface TransactionItemProps {
  transaction: TTransaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const isCredit = transaction.type === "credit"

  const getProviderLabel = (provider: TTransaction["provider"]) => {
    switch (provider) {
      case "onepay":
        return "OnePay"
      case "lypay":
        return "LYPay"
      case "cashback":
        return t("Cashback")
      case "service":
        return t("Grooming Service")
      case "alt_fee":
        return t("Priority Fee")
      case "refund":
        return t("Refund")
      case "transfer":
        return t("P2P Transfer Sent")
      default:
        return provider
    }
  }

  return (
    <Card className="p-3.5 border border-border-light dark:border-border-dark mb-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 pe-2">
          <View
            style={{
              backgroundColor: isCredit ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            }}
            className="w-10 h-10 rounded-2xl items-center justify-center"
          >
            <RTLIcon>
              {isCredit ? (
                <IconArrowDownLeft size={20} color="#10b981" strokeWidth={2.5} />
              ) : (
                <IconArrowUpRight size={20} color="#ef4444" strokeWidth={2.5} />
              )}
            </RTLIcon>
          </View>

          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold mb-0.5">
              {transaction.description}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text style={{ color: colors.muted }} className="text-2xs">
                {transaction.date} • {transaction.time}
              </Text>
              <Badge variant="outline" label={getProviderLabel(transaction.provider)} />
            </View>
          </View>
        </View>

        <Text
          style={{ color: isCredit ? "#10b981" : "#ef4444" }}
          className="font-extrabold text-sm font-mono"
        >
          {isCredit ? "+" : "-"}
          {transaction.amount.toFixed(2)} {t("LYD")}
        </Text>
      </View>
    </Card>
  )
}
