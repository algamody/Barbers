import React from "react"
import { View, Text, Image, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { StatusChip } from "@/components/ui/status-chip"
import type { TShop } from "@/typings"
import { IconMapPin, IconClock, IconUsers } from "@tabler/icons-react-native"

interface ShopHeroCardProps {
  shop: TShop
}

export function ShopHeroCard({ shop }: ShopHeroCardProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { colors } = useAppTheme()

  return (
    <Card variant="elevated" className="overflow-hidden border border-border-light dark:border-border-dark mb-4">
      {/* Hero Photo */}
      <Image
        source={{ uri: shop.photo }}
        className="w-full h-48 bg-surface-altLight dark:bg-surface-altDark"
        resizeMode="cover"
      />

      <View className="p-4 gap-3">
        {/* Title & Verification */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pe-2">
            <Text style={{ color: colors.text }} className="text-xl font-extrabold mb-1">
              {shop.nameAr}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              {shop.name}
            </Text>
          </View>

          {shop.isVerified && (
            <Badge variant="gold" label={t("Verified Salon")} />
          )}
        </View>

        {/* Rating and Distance */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Rating value={shop.rating} size={15} showValue />
            <Text style={{ color: colors.muted }} className="text-xs">
              ({shop.reviewCount} {t("Reviews")})
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <IconMapPin size={13} color={colors.gold} />
            <Text style={{ color: colors.muted }} className="text-xs">
              {shop.distance}
            </Text>
          </View>
        </View>

        {/* Live Community Status Chip with Direct Link */}
        <Pressable
          onPress={() => router.push({ pathname: "/community/[shopId]", params: { shopId: shop.id } })}
          className="active:opacity-80"
        >
          <View
            style={{ backgroundColor: colors.cardAlt, borderColor: colors.border }}
            className="p-3 rounded-2xl border flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <StatusChip isOpen={shop.isOpen} waitingCount={shop.waitingCount} isVerified={shop.isVerified} />
              <Text style={{ color: colors.text }} className="text-2xs font-semibold">
                {t("Current Queue Status")}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <IconUsers size={13} color={colors.gold} />
              <Text style={{ color: colors.gold }} className="text-2xs font-bold">
                {t("Community Updates ➔")}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Address and Working Hours */}
        <View className="pt-2 border-t border-border-light dark:border-border-dark gap-1.5">
          <View className="flex-row items-center gap-1.5">
            <IconMapPin size={13} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="text-2xs flex-1">
              {shop.address}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <IconClock size={13} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="text-2xs flex-1">
              {shop.workingHours.ar}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  )
}
