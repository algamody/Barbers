import React, { useMemo } from "react"
import { View, Text, ScrollView, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/ui/rating"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/feedback/skeleton"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/feedback/empty-state"
import { IconHeart, IconMapPin, IconCalendarPlus } from "@tabler/icons-react-native"

export default function FavoritesScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const shopsRequest = useMemo(() => api.shop.getShops(), [api])
  const { data: shops, isLoading } = use(shopsRequest)

  const profileRequest = useMemo(() => api.user.getProfile(), [api])
  const { data: profile } = use(profileRequest)

  const favoriteShops = useMemo(() => {
    if (!shops || !profile) return []
    return shops.filter((s) => profile.favorites.includes(s.id))
  }, [shops, profile])

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3 border-b border-border-light dark:border-border-dark">
        <BackButton />
        <Text style={{ color: colors.text }} className="text-base font-extrabold">
          {t("Favorite Salons")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} className="flex-1">
        {isLoading ? (
          <View className="gap-3">
            <Skeleton height={120} rounded="2xl" />
            <Skeleton height={120} rounded="2xl" />
          </View>
        ) : favoriteShops.length > 0 ? (
          <View className="gap-3.5">
            {favoriteShops.map((shop) => (
              <Card key={shop.id} className="p-4 border border-border-light dark:border-border-dark">
                <View className="flex-row items-center gap-3 mb-3">
                  <Image
                    source={{ uri: shop.photo }}
                    className="w-16 h-16 rounded-2xl bg-surface-altLight dark:bg-surface-altDark"
                  />

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text style={{ color: colors.text }} className="font-extrabold text-sm">
                        {shop.nameAr}
                      </Text>
                      <Rating value={shop.rating} size={12} showValue />
                    </View>

                    <View className="flex-row items-center gap-1 mb-1">
                      <IconMapPin size={12} color={colors.muted} />
                      <Text style={{ color: colors.muted }} className="text-2xs">
                        {shop.address}
                      </Text>
                    </View>

                    <Badge
                      variant={shop.isOpen ? "success" : "danger"}
                      label={shop.isOpen ? `${t("Open")} (~${shop.waitingCount} ${t("wait")})` : t("Closed")}
                    />
                  </View>
                </View>

                <View className="flex-row gap-2 pt-2 border-t border-border-light dark:border-border-dark">
                  <Button
                    variant="outline"
                    size="sm"
                    label={t("View Details")}
                    onPress={() => router.push({ pathname: "/shop/[id]", params: { id: shop.id } })}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    label={t("Book Now")}
                    icon={<IconCalendarPlus size={14} color="#ffffff" />}
                    onPress={() => router.push({ pathname: "/booking/[shopId]", params: { shopId: shop.id } })}
                    className="flex-1"
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <IconHeart size={36} color="#ef4444" strokeWidth={1.5} />
            </EmptyStateIcon>
            <EmptyStateTitle>{t("No favorite salons")}</EmptyStateTitle>
            <EmptyStateDescription>
              {t("Click heart icon on any salon to add it to your favorites.")}
            </EmptyStateDescription>
          </EmptyState>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
