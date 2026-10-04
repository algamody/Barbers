import React from "react"
import { View, Text, Image } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import type { TStaffMember } from "@/typings"
import { IconClock, IconAlertCircle } from "@tabler/icons-react-native"

interface ShopStaffRosterProps {
  staff: TStaffMember[]
}

export function ShopStaffRoster({ staff }: ShopStaffRosterProps) {
  const { t } = useTranslation()
  const { lang } = useAppLanguage()
  const { colors } = useAppTheme()

  return (
    <View className="gap-3">
      {staff.map((barber) => {
        const isInactive = barber.isActive === false
        const hasAltBooking = !!barber.altBooking

        return (
          <Card key={barber.id} className="p-4 border border-border-light dark:border-border-dark">
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: barber.photo }}
                className="w-13 h-13 rounded-2xl bg-surface-altLight dark:bg-surface-altDark"
              />

              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text style={{ color: colors.text }} className="font-extrabold text-sm">
                    {barber.name}
                  </Text>

                  {isInactive ? (
                    <Badge variant="danger" label={t("On Break")} />
                  ) : hasAltBooking ? (
                    <Badge variant="gold" label={t("Alternative seat available (5 LYD)")} />
                  ) : (
                    <Badge variant="success" label={t("Available for Booking")} />
                  )}
                </View>

                <View className="flex-row items-center gap-3">
                  <Rating value={barber.rating} size={12} showValue />
                  {!isInactive && (
                    <View className="flex-row items-center gap-1">
                      <IconClock size={12} color={colors.muted} />
                      <Text style={{ color: colors.muted }} className="text-2xs">
                        {barber.queue} {t("Customers waiting")} • ~{barber.avgWait} {t("Minutes")} {t("wait")}
                      </Text>
                    </View>
                  )}
                </View>

                {isInactive && barber.inactiveReason && (
                  <View className="flex-row items-center gap-1 mt-1.5">
                    <IconAlertCircle size={12} color={colors.muted} />
                    <Text style={{ color: colors.muted }} className="text-2xs">
                      {lang === "ar" ? barber.inactiveReason.ar : barber.inactiveReason.en}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        )
      })}
    </View>
  )
}
