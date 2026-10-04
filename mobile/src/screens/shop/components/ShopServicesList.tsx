import React, { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/ThemeContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TService, TAddon } from "@/typings"
import { cn } from "@/components/ui/button"

interface ShopServicesListProps {
  services: TService[]
  addons: TAddon[]
}

type ServiceFilter = "all" | "adult" | "child" | "addons"

export function ShopServicesList({ services, addons }: ShopServicesListProps) {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const [filter, setFilter] = useState<ServiceFilter>("all")

  const filteredServices = services.filter((s) => {
    if (filter === "all") return true
    if (filter === "adult") return s.target === "adult"
    if (filter === "child") return s.target === "child"
    return false
  })

  return (
    <View className="gap-4">
      {/* Category Filter Pills */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setFilter("all")}
          className="flex-1 active:opacity-80"
        >
          <Card
            variant={filter === "all" ? "elevated" : "default"}
            className={cn(
              "py-2 items-center border",
              filter === "all" ? "border-gold bg-gold/10" : "border-border-light dark:border-border-dark"
            )}
          >
            <Text style={{ color: filter === "all" ? colors.gold : colors.text }} className="text-2xs font-bold">
              {t("All")}
            </Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => setFilter("adult")}
          className="flex-1 active:opacity-80"
        >
          <Card
            variant={filter === "adult" ? "elevated" : "default"}
            className={cn(
              "py-2 items-center border",
              filter === "adult" ? "border-gold bg-gold/10" : "border-border-light dark:border-border-dark"
            )}
          >
            <Text style={{ color: filter === "adult" ? colors.gold : colors.text }} className="text-2xs font-bold">
              {t("Adults")}
            </Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => setFilter("child")}
          className="flex-1 active:opacity-80"
        >
          <Card
            variant={filter === "child" ? "elevated" : "default"}
            className={cn(
              "py-2 items-center border",
              filter === "child" ? "border-gold bg-gold/10" : "border-border-light dark:border-border-dark"
            )}
          >
            <Text style={{ color: filter === "child" ? colors.gold : colors.text }} className="text-2xs font-bold">
              {t("Children")}
            </Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => setFilter("addons")}
          className="flex-1 active:opacity-80"
        >
          <Card
            variant={filter === "addons" ? "elevated" : "default"}
            className={cn(
              "py-2 items-center border",
              filter === "addons" ? "border-gold bg-gold/10" : "border-border-light dark:border-border-dark"
            )}
          >
            <Text style={{ color: filter === "addons" ? colors.gold : colors.text }} className="text-2xs font-bold">
              {t("Addons")}
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Services List */}
      {filter !== "addons" ? (
        <View className="gap-2.5">
          {filteredServices.map((service) => (
            <Card key={service.id} className="p-3.5 border border-border-light dark:border-border-dark">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pe-2">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text style={{ color: colors.text }} className="font-bold text-xs">
                      {service.name}
                    </Text>
                    <Badge
                      variant={service.target === "child" ? "secondary" : "outline"}
                      label={service.target === "child" ? t("Children") : t("Adults")}
                    />
                  </View>
                  <Text style={{ color: colors.muted }} className="text-2xs">
                    {t("Approximate duration")}: {service.duration} {t("Minutes")}
                  </Text>
                </View>

                <Text style={{ color: colors.gold }} className="font-extrabold text-sm font-mono">
                  {service.price} {t("LYD")}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View className="gap-2.5">
          {addons.map((addon) => (
            <Card key={addon.id} className="p-3.5 border border-border-light dark:border-border-dark flex-row items-center justify-between">
              <Text style={{ color: colors.text }} className="font-bold text-xs">
                {addon.name}
              </Text>
              <Text style={{ color: colors.gold }} className="font-extrabold text-sm font-mono">
                +{addon.price} {t("LYD")}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </View>
  )
}
