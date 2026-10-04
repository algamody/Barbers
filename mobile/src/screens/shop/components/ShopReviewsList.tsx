import React from "react"
import { View, Text, Image } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import { Rating } from "@/components/ui/rating"
import { Badge } from "@/components/ui/badge"
import type { TReview } from "@/typings"
import { IconUser } from "@tabler/icons-react-native"

interface ShopReviewsListProps {
  reviews: TReview[]
}

export function ShopReviewsList({ reviews }: ShopReviewsListProps) {
  const { t } = useTranslation()
  const { colors } = useAppTheme()

  if (reviews.length === 0) {
    return (
      <Card className="p-6 items-center border border-border-light dark:border-border-dark">
        <Text style={{ color: colors.muted }} className="text-xs">
          {t("No written reviews for this salon yet.")}
        </Text>
      </Card>
    )
  }

  return (
    <View className="gap-3">
      {reviews.map((rev) => (
        <Card key={rev.id} className="p-4 border border-border-light dark:border-border-dark">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View
                style={{ backgroundColor: colors.cardAlt }}
                className="w-8 h-8 rounded-full items-center justify-center border border-border-light dark:border-border-dark"
              >
                <IconUser size={15} color={colors.gold} />
              </View>
              <View>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  {rev.name}
                </Text>
                <Text style={{ color: colors.muted }} className="text-2xs">
                  {rev.time}
                </Text>
              </View>
            </View>

            <Rating value={rev.rating} size={12} />
          </View>

          <Text style={{ color: colors.text }} className="text-xs leading-relaxed mb-2.5">
            "{rev.text}"
          </Text>

          <View className="flex-row items-center justify-between">
            <Badge variant="outline" label={rev.serviceUsed} />

            {rev.photos.length > 0 && (
              <View className="flex-row gap-1.5">
                {rev.photos.map((p, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: p }}
                    className="w-10 h-10 rounded-lg bg-surface-altLight dark:bg-surface-altDark"
                  />
                ))}
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  )
}
