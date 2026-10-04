import React, { useState, useEffect, useMemo } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Skeleton } from "@/components/feedback/skeleton"
import { showSnackbar } from "@/components/feedback/snackbar"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/feedback/empty-state"
import { BalanceCard } from "./components/BalanceCard"
import { TopUpModal } from "./components/TopUpModal"
import { TransferModal } from "./components/TransferModal"
import { TransactionItem } from "./components/TransactionItem"
import type { TP2PTransfer, TWalletState } from "@/typings"
import { IconReceipt2 } from "@tabler/icons-react-native"

export default function WalletScreen() {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [topUpVisible, setTopUpVisible] = useState(false)
  const [transferVisible, setTransferVisible] = useState(false)
  const [liveWallet, setLiveWallet] = useState<TWalletState | null>(null)

  // Query wallet via use() hook
  const walletRequest = useMemo(() => api.wallet.getWalletState(), [api])
  const { data: initialWallet, isLoading } = use(walletRequest)

  useEffect(() => {
    if (initialWallet) {
      setLiveWallet(initialWallet)
    }
  }, [initialWallet])

  // Real-time wallet subscription
  useEffect(() => {
    const unsubscribe = api.wallet.subscribeWallet((updatedState) => {
      setLiveWallet(updatedState)
    })
    return () => unsubscribe()
  }, [api])

  const wallet = liveWallet || initialWallet

  const handleTopUp = async (amount: number, provider: "onepay" | "lypay") => {
    const res = await api.wallet.topUp(amount, provider)
    if (res.success) {
      showSnackbar({
        title: `${amount} ${t("LYD topped up successfully!")}`,
        description: `${t("New balance in your wallet:")} ${res.newBalance.toFixed(2)} ${t("LYD")}`,
        type: "success",
      })
    }
  }

  const handleTransfer = async (transfer: TP2PTransfer) => {
    const res = await api.wallet.transferP2P(transfer)
    if (res.success) {
      showSnackbar({
        title: `${transfer.amount} ${t("LYD transferred successfully!")}`,
        description: `${t("Amount deposited instantly into wallet of")} ${transfer.recipientName}.`,
        type: "success",
      })
      return { success: true }
    } else {
      return { success: false, error: res.error }
    }
  }

  if (isLoading || !wallet) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1 p-5">
        <View className="flex-row items-center gap-3 mb-6">
          <BackButton />
          <Skeleton width={140} height={22} rounded="md" />
        </View>
        <Skeleton width="100%" height={220} rounded="3xl" className="mb-6" />
        <Skeleton width="100%" height={80} rounded="2xl" className="mb-3" />
        <Skeleton width="100%" height={80} rounded="2xl" />
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
            {t("Wallet")}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} className="flex-1">
        {/* Balance & Actions Card */}
        <BalanceCard
          wallet={wallet}
          onOpenTopUp={() => setTopUpVisible(true)}
          onOpenTransfer={() => setTransferVisible(true)}
        />

        {/* Transactions Section */}
        <View className="mt-2">
          <Text style={{ color: colors.text }} className="font-extrabold text-sm mb-3">
            {t("Transaction History")}
          </Text>

          {wallet.transactions.length > 0 ? (
            wallet.transactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <IconReceipt2 size={36} color={colors.gold} strokeWidth={1.5} />
              </EmptyStateIcon>
              <EmptyStateTitle>{t("No transactions yet")}</EmptyStateTitle>
              <EmptyStateDescription>
                {t("All top-up, payment, transfer, and refund transactions will appear here.")}
              </EmptyStateDescription>
            </EmptyState>
          )}
        </View>
      </ScrollView>

      {/* Top Up Bottom Sheet */}
      <TopUpModal
        visible={topUpVisible}
        onClose={() => setTopUpVisible(false)}
        onConfirmTopUp={handleTopUp}
      />

      {/* Transfer P2P Bottom Sheet */}
      <TransferModal
        visible={transferVisible}
        onClose={() => setTransferVisible(false)}
        userWalletId={wallet.walletId}
        currentBalance={wallet.balance}
        onConfirmTransfer={handleTransfer}
      />
    </SafeAreaView>
  )
}
