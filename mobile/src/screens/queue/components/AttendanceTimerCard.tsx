import React from "react"
import { View, Text } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCountdown } from "@/hooks/useCountdown"
import { QueueDomainService } from "@/services/domain/queue.domain"
import { IconClock, IconAlertCircle, IconShieldCheck } from "@tabler/icons-react-native"

interface AttendanceTimerCardProps {
  attendanceDeadline?: string | null
}

export function AttendanceTimerCard({
  attendanceDeadline,
}: AttendanceTimerCardProps) {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const countdown = useCountdown(attendanceDeadline)
  const phaseInfo = QueueDomainService.getAttendancePhase(attendanceDeadline)

  if (!attendanceDeadline || phaseInfo.phase === "none") {
    return null
  }

  const isProtected = phaseInfo.phase === "protected"
  const isOpen = phaseInfo.phase === "open"
  const isExpired = countdown.isExpired

  return (
    <Card
      variant="elevated"
      className="p-4 border border-border-light dark:border-border-dark mb-4"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {isProtected ? (
            <IconShieldCheck size={18} color={colors.gold} strokeWidth={2.2} />
          ) : (
            <IconAlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
          )}
          <Text style={{ color: colors.text }} className="font-bold text-xs">
            {isProtected ? t("Protected Attendance Phase") : t("Alternative Booking Window")}
          </Text>
        </View>

        <Badge
          variant={isExpired ? "danger" : isProtected ? "gold" : "danger"}
          label={
            isExpired
              ? t("Time Expired")
              : isProtected
              ? t("Protected for Booked Client")
              : t("Available for Alternative Claim")
          }
        />
      </View>

      <View className="flex-row items-baseline justify-between pt-1">
        <Text style={{ color: colors.muted }} className="text-xs flex-1 pe-2 leading-relaxed">
          {isProtected
            ? t("You are in the first 5 minutes; the chair is strictly reserved for you. Please proceed to the salon.")
            : t("Less than 5 minutes remain. The chair is now claimable as an alternative slot if you fail to attend.")}
        </Text>

        <Text
          style={{ color: isProtected ? colors.gold : "#ef4444" }}
          className="text-xl font-extrabold font-mono"
        >
          {countdown.formatted}
        </Text>
      </View>
    </Card>
  )
}
