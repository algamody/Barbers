import React, { useState, useEffect } from "react"
import { View, Text, Animated, Pressable } from "react-native"
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconX } from "@tabler/icons-react-native"
import { cn } from "../ui/button"

export interface SnackbarData {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "info"
  duration?: number
  onPress?: () => void
}

type Listener = (data: SnackbarData | null) => void
let currentListener: Listener | null = null

export function showSnackbar(data: Omit<SnackbarData, "id">) {
  const fullData: SnackbarData = {
    ...data,
    id: Math.random().toString(36).substring(7),
  }
  currentListener?.(fullData)
}

export function hideSnackbar() {
  currentListener?.(null)
}

export function SnackbarHost() {
  const [data, setData] = useState<SnackbarData | null>(null)
  const translateY = useState(new Animated.Value(100))[0]
  const opacity = useState(new Animated.Value(0))[0]

  useEffect(() => {
    currentListener = (newData) => {
      setData(newData)
    }
    return () => {
      currentListener = null
    }
  }, [])

  useEffect(() => {
    if (data) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      const timer = setTimeout(() => {
        handleDismiss()
      }, data.duration || 4000)

      return () => clearTimeout(timer)
    }
  }, [data])

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setData(null)
    })
  }

  if (!data) return null

  const isSuccess = data.type === "success"
  const isError = data.type === "error"

  const Icon = isSuccess ? IconCheck : isError ? IconAlertTriangle : IconInfoCircle
  const iconColor = isSuccess ? "#10b981" : isError ? "#ef4444" : "#e8722a"

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 34,
        left: 20,
        right: 20,
        transform: [{ translateY }],
        opacity,
        zIndex: 9999,
      }}
    >
      <Pressable
        onPress={() => {
          data.onPress?.()
          handleDismiss()
        }}
        className={cn(
          "flex-row items-center p-4 rounded-3xl border shadow-xl bg-surface-light dark:bg-surface-dark",
          isSuccess
            ? "border-emerald-500/40"
            : isError
            ? "border-red-500/40"
            : "border-primary/40"
        )}
      >
        <View
          style={{ backgroundColor: `${iconColor}20` }}
          className="w-10 h-10 rounded-2xl items-center justify-center me-3"
        >
          <Icon size={20} color={iconColor} strokeWidth={2.2} />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold text-content-light dark:text-content-dark">
            {data.title}
          </Text>
          {data.description && (
            <Text className="text-xs text-content-mutedLight dark:text-content-mutedDark mt-0.5">
              {data.description}
            </Text>
          )}
        </View>

        <Pressable onPress={handleDismiss} className="p-1">
          <IconX size={16} color="#888888" strokeWidth={2} />
        </Pressable>
      </Pressable>
    </Animated.View>
  )
}
