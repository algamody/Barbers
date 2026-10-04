import React, { useState } from "react"
import { View, Text, Image, Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import type { TGalleryPhoto } from "@/typings"
import { cn } from "@/components/ui/button"

interface ShopGalleryGridProps {
  galleryPhotos: TGalleryPhoto[]
}

export function ShopGalleryGrid({ galleryPhotos }: ShopGalleryGridProps) {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { key: "all", label: t("All") },
    { key: "beard", label: t("Beard & Mustache") },
    { key: "haircuts", label: t("Haircuts") },
    { key: "interior", label: t("Salon Interior") },
  ]

  const filteredPhotos = galleryPhotos.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  )

  return (
    <View className="gap-3.5">
      {/* Category Pills */}
      <View className="flex-row gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key
          return (
            <Pressable
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              className="flex-1 active:opacity-80"
            >
              <Card
                variant={isSelected ? "elevated" : "default"}
                className={cn(
                  "py-2 items-center border",
                  isSelected ? "border-gold bg-gold/10" : "border-border-light dark:border-border-dark"
                )}
              >
                <Text
                  style={{ color: isSelected ? colors.gold : colors.text }}
                  className="text-2xs font-bold"
                >
                  {cat.label}
                </Text>
              </Card>
            </Pressable>
          )
        })}
      </View>

      {/* Photos Grid */}
      <View className="flex-row flex-wrap gap-2.5">
        {filteredPhotos.map((photo) => (
          <View
            key={photo.id}
            style={{ width: "48%" }}
            className="rounded-2xl overflow-hidden border border-border-light dark:border-border-dark"
          >
            <Image
              source={{ uri: photo.url }}
              className="w-full h-36 bg-surface-altLight dark:bg-surface-altDark"
              resizeMode="cover"
            />
            <View
              style={{ backgroundColor: colors.card }}
              className="p-2"
            >
              <Text style={{ color: colors.text }} className="text-2xs font-bold numberOfLines={1}">
                {photo.title}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
