import React, { useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { BackButton } from "@/components/ui/back-button"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import { showSnackbar } from "@/components/feedback/snackbar"
import { IconPhone, IconDeviceMobile } from "@tabler/icons-react-native"

export default function ChangePhoneScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [newPhone, setNewPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOtp = () => {
    if (newPhone.trim().length < 8) {
      showSnackbar({
        title: t("Invalid phone number"),
        description: t("Please enter a valid Libyan phone number"),
        type: "error",
      })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("otp")
      showSnackbar({
        title: t("Verification code sent"),
        description: t("Demo verification code is: 1234"),
        type: "info",
      })
    }, 700)
  }

  const handleVerify = async () => {
    if (otp.length < 4) {
      showSnackbar({
        title: t("Code incomplete"),
        type: "error",
      })
      return
    }

    setLoading(true)
    try {
      await api.user.updateProfile({ phone: newPhone.trim() })
      showSnackbar({
        title: t("Phone number updated successfully!"),
        type: "success",
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3 border-b border-border-light dark:border-border-dark">
        <BackButton />
        <Text style={{ color: colors.text }} className="text-base font-extrabold">
          {t("Change Phone Number")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" className="p-5 border border-border-light dark:border-border-dark">
          <View className="items-center mb-4">
            <View
              style={{ backgroundColor: colors.gold }}
              className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-xs"
            >
              <IconDeviceMobile size={24} color="#ffffff" />
            </View>
            <Text style={{ color: colors.text }} className="text-sm font-bold text-center">
              {step === "phone" ? t("Enter new phone number") : t("Enter verification code to confirm")}
            </Text>
          </View>

          {step === "phone" ? (
            <View className="gap-4">
              <Input
                label={t("New Phone Number")}
                placeholder="091XXXXXXX"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
                leftIcon={<IconPhone size={16} color={colors.muted} />}
              />

              <Button
                label={t("Send Code to New Number")}
                loading={loading}
                onPress={handleSendOtp}
                fullWidth
              />
            </View>
          ) : (
            <View className="items-center gap-4">
              <OtpInput
                length={4}
                value={otp}
                onChange={setOtp}
                onComplete={handleVerify}
              />

              <Button
                label={t("Confirm & Save New Number")}
                loading={loading}
                onPress={handleVerify}
                fullWidth
                className="mt-2"
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
