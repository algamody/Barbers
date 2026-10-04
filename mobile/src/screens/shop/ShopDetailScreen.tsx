import React, { useState, useMemo } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { useApi } from "@/services/context/ApiContext"
import { use } from "@/hooks/use"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/feedback/skeleton"
import { ShopHeroCard } from "./components/ShopHeroCard"
import { ShopServicesList } from "./components/ShopServicesList"
import { ShopStaffRoster } from "./components/ShopStaffRoster"
import { ShopReviewsList } from "./components/ShopReviewsList"
import { ShopGalleryGrid } from "./components/ShopGalleryGrid"
import { IconHeart, IconCalendarPlus } from "@tabler/icons-react-native"

export default function ShopDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const shopId = id || "royal-cut"

  const { colors } = useAppTheme()
  const { t } = useAppLanguage()
  const api = useApi()

  const [activeTab, setActiveTab] = useState<string>("services")
  const [isFavorite, setIsFavorite] = useState(false)

  // Query shop via use() hook
  const shopRequest = useMemo(() => api.shop.getShopById(shopId), [api, shopId])
  const { data: shop, isLoading } = use(shopRequest)

  if (isLoading || !shop) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1 p-5">
        <View className="flex-row items-center gap-3 mb-6">
          <BackButton />
          <Skeleton width={160} height={22} rounded="md" />
        </View>
        <Skeleton width="100%" height={240} rounded="3xl" className="mb-4" />
        <Skeleton width="100%" height={60} rounded="2xl" className="mb-4" />
        <Skeleton width="100%" height={140} rounded="2xl" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg }} className="flex-1">
      {/* Top Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text style={{ color: colors.text }} className="text-base font-extrabold">
            {shop.nameAr}
          </Text>
        </View>

        <Pressable
          onPress={() => setIsFavorite(!isFavorite)}
          className="w-10 h-10 rounded-full items-center justify-center bg-surface-altLight dark:bg-surface-altDark active:opacity-75"
        >
          <IconHeart
            size={20}
            color={isFavorite ? "#ef4444" : colors.muted}
            fill={isFavorite ? "#ef4444" : "transparent"}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }} className="flex-1">
        {/* Shop Hero Card */}
        <ShopHeroCard shop={shop} />

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="services" label={t("Services")} />
            <TabsTrigger value="staff" label={t("Staff")} />
            <TabsTrigger value="reviews" label={t("Reviews")} />
            <TabsTrigger value="gallery" label={t("Gallery")} />
          </TabsList>

          <TabsContent value="services">
            <ShopServicesList services={shop.services} addons={shop.addons} />
          </TabsContent>

          <TabsContent value="staff">
            <ShopStaffRoster staff={shop.staff} />
          </TabsContent>

          <TabsContent value="reviews">
            <ShopReviewsList reviews={shop.reviews} />
          </TabsContent>

          <TabsContent value="gallery">
            <ShopGalleryGrid galleryPhotos={shop.galleryPhotos} />
          </TabsContent>
        </Tabs>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
        className="absolute bottom-0 start-0 end-0 p-4 border-t shadow-lg"
      >
        <Button
          variant="default"
          label={t("Book Now")}
          icon={<IconCalendarPlus size={18} color="#ffffff" />}
          onPress={() =>
            router.push({
              pathname: "/booking/[shopId]",
              params: { shopId: shop.id },
            })
          }
          fullWidth
        />
      </View>
    </SafeAreaView>
  )
}
