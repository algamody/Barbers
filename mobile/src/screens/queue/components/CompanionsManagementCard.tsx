import React from "react"
import { View, Text } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCountdown } from "@/hooks/useCountdown"
import type { TGroupBookingPerson } from "@/typings"
import {
  IconUsers,
  IconUserCheck,
  IconInfoCircle,
  IconClock,
  IconScissors,
} from "@tabler/icons-react-native"

interface CompanionsManagementCardProps {
  persons: TGroupBookingPerson[]
  onRemoveCompanion: (personId: string) => void
  disabled?: boolean
}

function CompanionRow({
  companion,
  onRemove,
  disabled,
}: {
  companion: TGroupBookingPerson
  onRemove: (id: string) => void
  disabled: boolean
}) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const countdown = useCountdown(companion.attendanceDeadline)

  return (
    <View
      style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
      className="p-3.5 rounded-xl border flex-row items-center justify-between"
    >
      <View className="flex-1 pe-2">
        <View className="flex-row items-center gap-2 mb-1">
          <Text style={{ color: colors.text }} className="text-xs font-bold">
            {companion.name}
          </Text>
          {companion.confirmed ? (
            <View className="flex-row items-center gap-1">
              <IconUserCheck size={12} color="#10b981" />
              <Text style={{ color: "#10b981" }} className="text-2xs font-semibold">
                {t("Present & Confirmed")}
              </Text>
            </View>
          ) : (
            <Badge variant="secondary" label={t("Waiting")} />
          )}
        </View>

        <View className="flex-row items-center gap-1 mb-1">
          <IconScissors size={12} color={colors.gold} />
          <Text style={{ color: colors.muted }} className="text-2xs">
            {t("Barber Track:")} <Text style={{ color: colors.text }}>{companion.staffName}</Text>
          </Text>
        </View>

        <Text style={{ color: colors.muted }} className="text-2xs">
          {companion.serviceName} • {companion.price} {t("LYD")}
        </Text>

        {/* Independent attendance deadline if assigned */}
        {companion.attendanceDeadline && !companion.confirmed && (
          <View className="flex-row items-center gap-1 mt-1.5 bg-gold/10 px-2 py-0.5 rounded-md self-start">
            <IconClock size={11} color={colors.gold} />
            <Text style={{ color: colors.gold }} className="text-2xs font-mono font-bold">
              {t("Attendance Timer:")} {countdown.formatted}
            </Text>
          </View>
        )}
      </View>

      <Button
        variant="danger"
        size="sm"
        label={t("Remove Companion")}
        disabled={disabled || companion.confirmed}
        onPress={() => onRemove(companion.id)}
      />
    </View>
  )
}

export function CompanionsManagementCard({
  persons,
  onRemoveCompanion,
  disabled = false,
}: CompanionsManagementCardProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const companions = persons.filter((p) => !p.isMe)
  if (companions.length === 0) return null

  return (
    <Card className="p-4 border border-border-light dark:border-border-dark mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <IconUsers size={18} color={colors.gold} strokeWidth={2.2} />
          <Text style={{ color: colors.text }} className="font-bold text-xs">
            {t("Manage Companions & Barber Queues")}
          </Text>
        </View>
        <Badge variant="outline" label={`${companions.length} ${t("companions")}`} />
      </View>

      <View
        style={{ backgroundColor: colors.cardAlt }}
        className="p-2.5 rounded-xl flex-row items-start gap-2 mb-3 border border-border-light dark:border-border-dark"
      >
        <IconInfoCircle size={15} color={colors.gold} className="mt-0.5" />
        <Text style={{ color: colors.muted }} className="text-2xs flex-1 leading-relaxed">
          {t("If a companion cannot attend, you can remove them now and get an instant wallet refund without penalty.")}
        </Text>
      </View>

      <View className="gap-2.5">
        {companions.map((companion) => (
          <CompanionRow
            key={companion.id}
            companion={companion}
            onRemove={onRemoveCompanion}
            disabled={disabled}
          />
        ))}
      </View>
    </Card>
  )
}
