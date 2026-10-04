import React from "react"
import { View, Text, Pressable } from "react-native"
import { useAppTheme } from "@/theme/ThemeContext"
import { useAppLanguage } from "@/locals/LanguageContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TService, TAddon } from "@/typings"
import { IconCheck, IconScissors, IconSparkles } from "@tabler/icons-react-native"
import { cn } from "@/components/ui/button"

interface ServicesStepProps {
  services: TService[]
  addons: TAddon[]
  selectedServiceId?: string
  selectedAddonIds: string[]
  onSelectService: (serviceId: string) => void
  onToggleAddon: (addonId: string) => void
}

export function ServicesStep({
  services,
  addons,
  selectedServiceId,
  selectedAddonIds,
  onSelectService,
  onToggleAddon,
}: ServicesStepProps) {
  const { colors } = useAppTheme()
  const { t } = useAppLanguage()

  return (
    <View className="gap-6">
      {/* Services List */}
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <IconScissors size={18} color={colors.gold} strokeWidth={2.2} />
          <Text style={{ color: colors.text }} className="font-bold text-sm">
            {t("Services")} ({t("Choose primary service")})
          </Text>
        </View>

        <View className="gap-2.5">
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id
            return (
              <Pressable
                key={service.id}
                onPress={() => onSelectService(service.id)}
                className="active:opacity-85"
              >
                <Card
                  variant={isSelected ? "elevated" : "default"}
                  className={cn(
                    "p-4 border",
                    isSelected ? "border-gold" : "border-border-light dark:border-border-dark"
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pe-2">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text style={{ color: colors.text }} className="font-bold text-sm">
                          {service.name}
                        </Text>
                        <Badge
                          variant={service.target === "child" ? "secondary" : "outline"}
                          label={service.target === "child" ? t("Kids") : t("Adults")}
                        />
                      </View>
                      <Text style={{ color: colors.muted }} className="text-xs">
                        {t("Approximate duration")}: {service.duration} {t("min")}
                      </Text>
                    </View>

                    <View className="items-end gap-1.5">
                      <Text style={{ color: colors.gold }} className="font-extrabold text-base">
                        {service.price} {t("LYD")}
                      </Text>
                      {isSelected ? (
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
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* Addons List */}
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <IconSparkles size={18} color={colors.gold} strokeWidth={2.2} />
          <Text style={{ color: colors.text }} className="font-bold text-sm">
            {t("Addons")} ({t("Optional upgrades")})
          </Text>
        </View>

        <View className="gap-2.5">
          {addons.map((addon) => {
            const isSelected = selectedAddonIds.includes(addon.id)
            return (
              <Pressable
                key={addon.id}
                onPress={() => onToggleAddon(addon.id)}
                className="active:opacity-85"
              >
                <Card
                  variant={isSelected ? "elevated" : "default"}
                  className={cn(
                    "p-3.5 border flex-row items-center justify-between",
                    isSelected ? "border-gold" : "border-border-light dark:border-border-dark"
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        backgroundColor: isSelected ? colors.gold : "transparent",
                        borderColor: isSelected ? colors.gold : colors.border,
                      }}
                      className="w-5 h-5 rounded-md border items-center justify-center"
                    >
                      {isSelected && <IconCheck size={12} color="#ffffff" strokeWidth={3} />}
                    </View>
                    <Text style={{ color: colors.text }} className="text-xs font-semibold">
                      {addon.name}
                    </Text>
                  </View>

                  <Text style={{ color: colors.gold }} className="font-bold text-xs">
                    +{addon.price} {t("LYD")}
                  </Text>
                </Card>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}
