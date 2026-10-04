import React, { useState } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import { BackButton } from "@/components/ui/back-button"
import { showSnackbar } from "@/components/feedback/snackbar"
import { IconScissors, IconPhone, IconUser, IconCheck, IconRotateClockwise } from "@tabler/icons-react-native"

export default function AuthScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)

  const handleSendOtp = () => {
    if (phone.trim().length < 8) {
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
        description: t("Demo code sent to {{phone}} (Code: 1234)", { phone }),
        type: "info",
      })
    }, 800)
  }

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otp
    if (finalOtp.length < 4) {
      showSnackbar({
        title: t("Code incomplete"),
        description: t("Please enter 4 digits"),
        type: "error",
      })
      return
    }

    setLoading(true)
    try {
      await api.user.updateProfile({
        name: name.trim() || t("Mohamed Al-Gamody"),
        phone: phone.trim(),
      })

      showSnackbar({
        title: t("Logged in successfully!"),
        type: "success",
      })

      router.replace("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        {/* Header Branding */}
        <View className="items-center mb-8">
          <View
            style={{ backgroundColor: colors.gold }}
            className="w-16 h-16 rounded-3xl items-center justify-center shadow-md mb-3"
          >
            <IconScissors size={32} color="#ffffff" strokeWidth={2.2} />
          </View>

          <Text style={{ color: colors.text }} className="text-2xl font-extrabold tracking-wider mb-1">
            {t("appName")}
          </Text>
          <Text style={{ color: colors.muted }} className="text-xs text-center">
            {step === "phone"
              ? t("Sign in to book your spot in the live queue")
              : t("Enter verification code sent to {{phone}}", { phone })}
          </Text>
        </View>

        {/* Step Card */}
        <Card variant="elevated" className="p-6 border border-border-light dark:border-border-dark">
          {step === "phone" ? (
            <View className="gap-4">
              <Input
                label={t("Full Name")}
                placeholder={t("e.g. Mohamed Al-Gamody")}
                value={name}
                onChangeText={setName}
                leftIcon={<IconUser size={18} color={colors.muted} />}
              />

              <Input
                label={t("Libyan Phone Number")}
                placeholder="091XXXXXXX"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                leftIcon={<IconPhone size={18} color={colors.muted} />}
                helperText={t("We will send a quick verification code via SMS")}
              />

              <Button
                label={t("Send Verification Code")}
                loading={loading}
                onPress={handleSendOtp}
                fullWidth
                className="mt-2"
              />
            </View>
          ) : (
            <View className="items-center gap-5">
              <Text style={{ color: colors.text }} className="text-xs font-semibold">
                {t("Verification Code (4 Digits)")}:
              </Text>

              <OtpInput
                length={4}
                value={otp}
                onChange={setOtp}
                onComplete={(code) => handleVerifyOtp(code)}
              />

              <View className="flex-row items-center justify-between w-full pt-2">
                <Pressable
                  onPress={() => setStep("phone")}
                  className="active:opacity-75"
                >
                  <Text style={{ color: colors.muted }} className="text-xs">
                    {t("Change Phone")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSendOtp}
                  className="flex-row items-center gap-1 active:opacity-75"
                >
                  <IconRotateClockwise size={13} color={colors.gold} />
                  <Text style={{ color: colors.gold }} className="text-xs font-bold">
                    {t("Resend Code")}
                  </Text>
                </Pressable>
              </View>

              <Button
                label={t("Confirm Login")}
                loading={loading}
                onPress={() => handleVerifyOtp()}
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
