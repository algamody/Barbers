import React from "react"
import { Pressable, type PressableProps } from "react-native"
import { useRouter } from "expo-router"
import { IconChevronLeft } from "@tabler/icons-react-native"
import { RTLIcon } from "./rtl-icon"
import { cn } from "./button"

export interface BackButtonProps extends PressableProps {
  onPress?: () => void
  color?: string
  size?: number
  className?: string
}

export function BackButton({
  onPress,
  color,
  size = 22,
  className,
  ...props
}: BackButtonProps) {
  const router = useRouter()

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else if (router.canGoBack()) {
      router.back()
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className={cn(
        "w-10 h-10 rounded-full items-center justify-center bg-surface-altLight dark:bg-surface-altDark active:opacity-70",
        className
      )}
      {...props}
    >
      <RTLIcon>
        <IconChevronLeft size={size} color={color || "#e8722a"} strokeWidth={2.2} />
      </RTLIcon>
    </Pressable>
  )
}

export default BackButton
