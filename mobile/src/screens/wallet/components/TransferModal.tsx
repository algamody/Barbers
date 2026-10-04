import React, { useState } from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TP2PTransfer } from "@/typings"

interface TransferModalProps {
  visible: boolean
  onClose: () => void
  userWalletId: string
  currentBalance: number
  onConfirmTransfer: (transfer: TP2PTransfer) => Promise<{ success: boolean; error?: string }>
}

export function TransferModal({
  visible,
  onClose,
  userWalletId,
  currentBalance,
  onConfirmTransfer,
}: TransferModalProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const [recipientId, setRecipientId] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [amountStr, setAmountStr] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTransfer = async () => {
    setError(null)
    const amount = parseFloat(amountStr)

    if (!recipientId.trim()) {
      setError(t("Please enter recipient wallet ID"))
      return
    }

    if (recipientId.trim() === userWalletId.trim()) {
      setError(t("Cannot transfer to your own wallet"))
      return
    }

    if (isNaN(amount) || amount <= 0) {
      setError(t("Please enter a valid amount greater than zero"))
      return
    }

    if (amount > currentBalance) {
      setError(`${t("Your balance is insufficient")} (${currentBalance} ${t("LYD")})`)
      return
    }

    setLoading(true)
    try {
      const transferData: TP2PTransfer = {
        recipientWalletId: recipientId.trim(),
        recipientName: recipientName.trim() || t("Customer"),
        recipientPhoneMasked: "+21891***55",
        amount,
      }

      const res = await onConfirmTransfer(transferData)
      if (res.success) {
        setRecipientId("")
        setAmountStr("")
        setRecipientName("")
        onClose()
      } else {
        setError(res.error || t("Transfer failed"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("P2P Transfer")}>
      <View className="gap-4 pb-4">
        <Text style={{ color: colors.muted }} className="text-xs leading-relaxed">
          {t("Direct and instant transfer from your wallet to a friend's without any extra fees.")}
        </Text>

        <Input
          label={t("Recipient Wallet ID")}
          placeholder={t("e.g. LY-BARBER-4412")}
          value={recipientId}
          onChangeText={setRecipientId}
          autoCapitalize="characters"
        />

        <Input
          label={t("Recipient Name (Optional)")}
          placeholder={t("e.g. Tarek Elmagbri")}
          value={recipientName}
          onChangeText={setRecipientName}
        />

        <Input
          label={t("Transfer Amount")}
          placeholder={`0.00 ${t("LYD")}`}
          keyboardType="decimal-pad"
          value={amountStr}
          onChangeText={setAmountStr}
          helperText={`${t("Current Balance")}: ${currentBalance} ${t("LYD")}`}
        />

        {error && (
          <View className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <Text className="text-xs text-red-500 font-medium">{error}</Text>
          </View>
        )}

        <Button
          label={t("Confirm Transfer")}
          loading={loading}
          onPress={handleTransfer}
          fullWidth
          className="mt-2"
        />
      </View>
    </BottomSheet>
  )
}
