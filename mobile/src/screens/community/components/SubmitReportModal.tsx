import React, { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { BottomSheet } from "@/components/feedback/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/components/ui/button"
import type { TCommunityReport } from "@/typings"

interface SubmitReportModalProps {
  visible: boolean
  onClose: () => void
  userName: string
  onSubmitReport: (
    data: Omit<TCommunityReport, "id" | "confirmedCount" | "unconfirmedCount">
  ) => Promise<void>
}

export function SubmitReportModal({
  visible,
  onClose,
  userName,
  onSubmitReport,
}: SubmitReportModalProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const [isOpen, setIsOpen] = useState(true)
  const [waitingCountStr, setWaitingCountStr] = useState("3")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const waitingCount = parseInt(waitingCountStr, 10) || 0
    setLoading(true)

    try {
      await onSubmitReport({
        userName,
        isOpen,
        waitingCount,
        note: note.trim() || undefined,
        time: new Date().toISOString(),
      })
      setNote("")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("Submit Status Update")}>
      <View className="gap-4 pb-4">
        <Text style={{ color: colors.muted }} className="text-xs leading-relaxed">
          {t("Share current salon status accurately to help others estimate wait times.")}
        </Text>

        {/* Status Switcher (Open vs Closed) */}
        <View className="gap-2">
          <Text style={{ color: colors.text }} className="text-xs font-bold">
            {t("Shop Status")}:
          </Text>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setIsOpen(true)}
              className="flex-1 active:opacity-85"
            >
              <Card
                variant={isOpen ? "elevated" : "default"}
                className={cn(
                  "p-3 items-center border",
                  isOpen ? "border-emerald-600 bg-emerald-500/10" : "border-border-light dark:border-border-dark"
                )}
              >
                <Text
                  style={{ color: isOpen ? "#10b981" : colors.text }}
                  className="font-bold text-xs"
                >
                  {t("Salon Open")}
                </Text>
              </Card>
            </Pressable>

            <Pressable
              onPress={() => setIsOpen(false)}
              className="flex-1 active:opacity-85"
            >
              <Card
                variant={!isOpen ? "elevated" : "default"}
                className={cn(
                  "p-3 items-center border",
                  !isOpen ? "border-red-600 bg-red-500/10" : "border-border-light dark:border-border-dark"
                )}
              >
                <Text
                  style={{ color: !isOpen ? "#ef4444" : colors.text }}
                  className="font-bold text-xs"
                >
                  {t("Salon Closed")}
                </Text>
              </Card>
            </Pressable>
          </View>
        </View>

        {/* Waiting Count */}
        {isOpen && (
          <Input
            label={t("Waiting Customers")}
            placeholder={t("e.g. 4")}
            keyboardType="number-pad"
            value={waitingCountStr}
            onChangeText={setWaitingCountStr}
            helperText={t("Approximate number of waiting customers")}
          />
        )}

        {/* Note */}
        <Input
          label={t("Field Note (Optional)")}
          placeholder={t("e.g. Barbers Tarek and Mohamed are present, quick movement...")}
          value={note}
          onChangeText={setNote}
        />

        <Button
          label={t("Publish Update to Everyone")}
          loading={loading}
          onPress={handleSubmit}
          fullWidth
          className="mt-2"
        />
      </View>
    </BottomSheet>
  )
}
