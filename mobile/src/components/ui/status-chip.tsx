import React from "react"
import { View, Text } from "react-native"
import { IconShieldCheck, IconUsers } from "@tabler/icons-react-native"
import { useAppLanguage } from "@/locals/LanguageContext"
import { cn } from "./button"

export interface StatusChipProps {
  isOpen: boolean
  waitingCount?: number
  isVerified?: boolean
  isCommunityUpdate?: boolean
  className?: string
}

export function StatusChip({
  isOpen,
  waitingCount,
  isVerified,
  isCommunityUpdate,
  className,
}: StatusChipProps) {
  const { t } = useAppLanguage()

  return (
    <View
      className={cn(
        "flex-row items-center px-2.5 py-1 rounded-full border self-start gap-1.5",
        isOpen
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600"
          : "bg-stone-500/10 border-stone-500/25 text-stone-500",
        className
      )}
    >
      {/* Pulsing Dot */}
      <View
        className={cn(
          "w-2 h-2 rounded-full",
          isOpen ? "bg-emerald-500" : "bg-stone-500"
        )}
      />

      {/* Status Label */}
      <Text
        className={cn(
          "text-[11px] font-bold",
          isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-stone-500"
        )}
      >
        {isOpen ? t("Open") : t("Closed")}
      </Text>

      {/* Waiting count if available and open */}
      {isOpen && typeof waitingCount === "number" && (
        <>
          <Text className="text-[10px] text-content-mutedLight dark:text-content-mutedDark font-medium">
            •
          </Text>
          <View className="flex-row items-center gap-1">
            <IconUsers size={11} color="#888888" strokeWidth={2} />
            <Text className="text-[11px] font-bold text-content-light dark:text-content-dark">
              {waitingCount} {t("waiting")}
            </Text>
          </View>
        </>
      )}

      {/* Verification / Community Badge */}
      {isVerified ? (
        <View className="ms-0.5">
          <IconShieldCheck size={12} color="#e8722a" strokeWidth={2.2} />
        </View>
      ) : isCommunityUpdate ? (
        <View className="px-1 py-0.2 bg-gold/15 rounded-md ms-0.5">
          <Text className="text-[9px] font-bold text-gold">{t("Community")}</Text>
        </View>
      ) : null}
    </View>
  )
}
