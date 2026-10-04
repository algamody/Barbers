import React from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TCommunityReport } from "@/typings"
import { IconThumbUp, IconThumbDown, IconUser, IconClock } from "@tabler/icons-react-native"

interface ReportCardProps {
  report: TCommunityReport
  onVote: (reportId: string, vote: "correct" | "incorrect") => void
}

export function ReportCard({ report, onVote }: ReportCardProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  return (
    <Card className="p-4 border border-border-light dark:border-border-dark mb-3">
      {/* Author and Status */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View
            style={{ backgroundColor: colors.cardAlt }}
            className="w-8 h-8 rounded-full items-center justify-center border border-border-light dark:border-border-dark"
          >
            <IconUser size={16} color={colors.gold} />
          </View>
          <View>
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              {report.userName}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {new Date(report.time).toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        <Badge
          variant={report.isOpen ? "success" : "danger"}
          label={
            report.isOpen
              ? `${t("Salon Open")} (~${report.waitingCount} ${t("Customers waiting")})`
              : t("Salon Closed")
          }
        />
      </View>

      {/* Note */}
      {report.note && (
        <Text style={{ color: colors.text }} className="text-xs leading-relaxed mb-3">
          "{report.note}"
        </Text>
      )}

      {/* Voting Bar */}
      <View className="flex-row items-center justify-between pt-2.5 border-t border-border-light dark:border-border-dark">
        <Text style={{ color: colors.muted }} className="text-2xs">
          {t("Is this report accurate and verified?")}
        </Text>

        <View className="flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            label={`${t("Vote Accurate")} (${report.confirmedCount})`}
            icon={<IconThumbUp size={13} color="#10b981" />}
            onPress={() => onVote(report.id, "correct")}
          />
          <Button
            variant="outline"
            size="sm"
            label={`${t("Vote Inaccurate")} (${report.unconfirmedCount})`}
            icon={<IconThumbDown size={13} color="#ef4444" />}
            onPress={() => onVote(report.id, "incorrect")}
          />
        </View>
      </View>
    </Card>
  )
}
