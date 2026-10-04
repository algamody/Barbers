import React, { useState, useMemo } from "react"
import { View, Text, ScrollView, Pressable, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/ui/rating"
import { Skeleton } from "@/components/feedback/skeleton"
import type { TShop } from "@/typings"
import { IconMapPin, IconCompass, IconScissors, IconNavigation } from "@tabler/icons-react-native"
import { cn } from "@/components/ui/button"

export default function MapScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const shopsRequest = useMemo(() => api.shop.getShops(), [api])
  const { data: shops, isLoading } = use(shopsRequest)

  const [selectedShopId, setSelectedShopId] = useState<string>("royal-cut")

  const selectedShop = useMemo(() => {
    return shops?.find((s) => s.id === selectedShopId) || shops?.[0]
  }, [shops, selectedShopId])

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <View>
            <Text style={{ color: colors.text }} className="text-base font-extrabold">
              {t("Salons Map")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-2xs">
              {t("Greater Tripoli, Libya")}
            </Text>
          </View>
        </View>

        <Badge variant="gold" label={t("Live Positioning")} />
      </View>

      {/* Map Canvas Simulation */}
      <View className="flex-1 relative">
        <View
          style={{ backgroundColor: colors.cardAlt }}
          className="w-full h-full items-center justify-center relative overflow-hidden"
        >
          {/* Stylized Grid Lines */}
          <View className="absolute inset-0 opacity-15">
            <View className="w-full h-full border border-border-light dark:border-border-dark" />
          </View>

          {/* Interactive Shop Pins */}
          <View className="w-full h-full p-8 relative">
            {shops?.map((shop, idx) => {
              const isSelected = selectedShop?.id === shop.id
              // Relative pin positioning
              const topPos = idx === 0 ? "35%" : "55%"
              const leftPos = idx === 0 ? "40%" : "65%"

              return (
                <Pressable
                  key={shop.id}
                  onPress={() => setSelectedShopId(shop.id)}
                  style={{ position: "absolute", top: topPos as any, left: leftPos as any }}
                  className="items-center active:opacity-80"
                >
                  <View
                    style={{
                      backgroundColor: isSelected ? colors.gold : colors.card,
                      borderColor: colors.gold,
                      shadowColor: colors.gold,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-2xl border-2 flex-row items-center gap-1.5 mb-1",
                      isSelected ? "scale-110" : ""
                    )}
                  >
                    <IconScissors size={14} color={isSelected ? "#ffffff" : colors.gold} />
                    <Text
                      style={{ color: isSelected ? "#ffffff" : colors.text }}
                      className="font-bold text-xs"
                    >
                      {shop.nameAr}
                    </Text>
                  </View>

                  {/* Pin Pointer */}
                  <View
                    style={{ backgroundColor: isSelected ? colors.gold : colors.card }}
                    className="w-3 h-3 rotate-45 border-r border-b border-gold -mt-2"
                  />
                </Pressable>
              )
            })}
          </View>

          {/* User Location Center Marker */}
          <View
            style={{
              position: "absolute",
              bottom: "40%",
              left: "25%",
            }}
            className="items-center"
          >
            <View className="w-6 h-6 rounded-full bg-blue-500/20 items-center justify-center">
              <View className="w-3 h-3 rounded-full bg-blue-500" />
            </View>
            <Text style={{ color: colors.muted }} className="text-[10px] font-bold mt-1">
              {t("Your Current Location")}
            </Text>
          </View>
        </View>

        {/* Floating Selected Salon Preview Card */}
        {selectedShop && (
          <View className="absolute bottom-5 start-4 end-4 shadow-xl">
            <Card variant="elevated" className="p-4 border border-border-light dark:border-border-dark">
              <View className="flex-row items-center gap-3 mb-3">
                <Image
                  source={{ uri: selectedShop.photo }}
                  className="w-16 h-16 rounded-2xl bg-surface-altLight dark:bg-surface-altDark"
                />

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text style={{ color: colors.text }} className="font-extrabold text-sm">
                      {selectedShop.nameAr}
                    </Text>
                    <Rating value={selectedShop.rating} size={12} showValue />
                  </View>

                  <View className="flex-row items-center gap-1 mb-1">
                    <IconMapPin size={12} color={colors.gold} />
                    <Text style={{ color: colors.muted }} className="text-2xs">
                      {selectedShop.address} ({selectedShop.distance})
                    </Text>
                  </View>

                  <Badge
                    variant={selectedShop.isOpen ? "success" : "danger"}
                    label={selectedShop.isOpen ? `${t("Open")} (~${selectedShop.waitingCount} ${t("wait")})` : t("Closed")}
                  />
                </View>
              </View>

              <View className="flex-row gap-2 pt-2 border-t border-border-light dark:border-border-dark">
                <Button
                  variant="outline"
                  size="sm"
                  label={t("View Salon")}
                  onPress={() => router.push({ pathname: "/shop/[id]", params: { id: selectedShop.id } })}
                  className="flex-1"
                />
                <Button
                  variant="default"
                  size="sm"
                  label={t("Book Now")}
                  onPress={() => router.push({ pathname: "/booking/[shopId]", params: { shopId: selectedShop.id } })}
                  className="flex-1"
                />
              </View>
            </Card>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
