import React, { useEffect, useRef } from "react"
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  type ViewProps,
} from "react-native"
import { IconX } from "@tabler/icons-react-native"
import { cn } from "../ui/button"

export interface BottomSheetProps extends ViewProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  className,
  style,
}: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="absolute inset-0 bg-black/60"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Content Sheet */}
        <Animated.View
          style={[
            { transform: [{ translateY: slideAnim }] },
            style,
          ]}
          className={cn(
            "w-full bg-surface-light dark:bg-surface-dark rounded-t-3xl border-t border-border-light dark:border-border-dark p-6 max-h-[85%]",
            className
          )}
        >
          {/* Drag Handle */}
          <View className="items-center mb-4">
            <View className="w-12 h-1.5 rounded-full bg-border-light dark:bg-border-dark" />
          </View>

          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-content-light dark:text-content-dark">
                {title || ""}
              </Text>

              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  className="w-8 h-8 rounded-full items-center justify-center bg-surface-altLight dark:bg-surface-altDark active:opacity-70"
                >
                  <IconX size={16} color="#888888" strokeWidth={2.2} />
                </Pressable>
              )}
            </View>
          )}

          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}
