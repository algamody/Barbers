import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import type { TStaffMember } from "@/typings"
import { IconCheck, IconUser, IconClock, IconUsers } from "@tabler/icons-react-native"
import { cn } from "@/components/ui/button"

interface BarberStepProps {
  staff: TStaffMember[]
  selectedStaffId: string | null
  onSelectStaff: (staffId: string | null) => void
}

export function BarberStep({
  staff,
  selectedStaffId,
  onSelectStaff,
}: BarberStepProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  const isAnySelected = selectedStaffId === null

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2 mb-1">
        <IconUser size={18} color={colors.gold} strokeWidth={2.2} />
        <Text style={{ color: colors.text }} className="font-bold text-sm">
          {t("Barber")} ({t("Choose preferred barber")})
        </Text>
      </View>

      {/* Option: Any Available Barber */}
      <Pressable onPress={() => onSelectStaff(null)} className="active:opacity-85">
        <Card
          variant={isAnySelected ? "elevated" : "default"}
          className={cn(
            "p-4 border flex-row items-center justify-between",
            isAnySelected ? "border-gold" : "border-border-light dark:border-border-dark"
          )}
        >
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: colors.gold }}
              className="w-12 h-12 rounded-2xl items-center justify-center shadow-xs"
            >
              <IconUsers size={22} color="#ffffff" strokeWidth={2.2} />
            </View>
            <View>
              <Text style={{ color: colors.text }} className="font-bold text-sm">
                {t("Any Available Barber")}
              </Text>
              <Text style={{ color: colors.muted }} className="text-xs">
                {t("Enter first available barber to reduce wait time")}
              </Text>
            </View>
          </View>

          {isAnySelected ? (
            <View
              style={{ backgroundColor: colors.gold }}
              className="w-5 h-5 rounded-full items-center justify-center"
            >
              <IconCheck size={12} color="#ffffff" strokeWidth={3} />
            </View>
          ) : (
            <View style={{ borderColor: colors.border }} className="w-5 h-5 rounded-full border" />
          )}
        </Card>
      </Pressable>

      {/* Specific Barbers */}
      <View className="gap-2.5">
        {staff.map((barber) => {
          const isSelected = selectedStaffId === barber.id
          const isInactive = barber.isActive === false

          return (
            <Pressable
              key={barber.id}
              disabled={isInactive}
              onPress={() => onSelectStaff(barber.id)}
              className={cn("active:opacity-85", isInactive && "opacity-50")}
            >
              <Card
                variant={isSelected ? "elevated" : "default"}
                className={cn(
                  "p-4 border",
                  isSelected ? "border-gold" : "border-border-light dark:border-border-dark"
                )}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1 pe-2">
                    <Image
                      source={{ uri: barber.photo }}
                      className="w-12 h-12 rounded-2xl bg-surface-altLight dark:bg-surface-altDark"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text style={{ color: colors.text }} className="font-bold text-sm">
                          {barber.name}
                        </Text>
                        {isInactive && (
                          <Badge variant="danger" label={t("Currently unavailable")} />
                        )}
                      </View>

                      <View className="flex-row items-center gap-3">
                        <Rating value={barber.rating} size={12} showValue />
                        {!isInactive && (
                          <View className="flex-row items-center gap-1">
                            <IconClock size={12} color={colors.muted} />
                            <Text style={{ color: colors.muted }} className="text-2xs">
                              {barber.queue} {t("Customers waiting")} • ~{barber.avgWait} {t("min")}
                            </Text>
                          </View>
                        )}
                      </View>

                      {isInactive && barber.inactiveReason && (
                        <Text style={{ color: colors.muted }} className="text-2xs mt-1">
                          {barber.inactiveReason.ar}
                        </Text>
                      )}
                    </View>
                  </View>

                  {!isInactive && (
                    isSelected ? (
                      <View
                        style={{ backgroundColor: colors.gold }}
                        className="w-5 h-5 rounded-full items-center justify-center"
                      >
                        <IconCheck size={12} color="#ffffff" strokeWidth={3} />
                      </View>
                    ) : (
                      <View
                        style={{ borderColor: colors.border }}
                        className="w-5 h-5 rounded-full border"
                      />
                    )
                  )}
                </View>
              </Card>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
