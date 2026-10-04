import React, { useEffect, useRef } from "react"
import { Animated, type ViewProps } from "react-native"
import { cn } from "../ui/button"

export interface SkeletonProps extends ViewProps {
  width?: number | string
  height?: number | string
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  className?: string
}

export function Skeleton({
  width,
  height,
  rounded = "xl",
  className,
  style,
  ...props
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()

    return () => animation.stop()
  }, [opacity])

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  }[rounded]

  return (
    <Animated.View
      style={[
        {
          opacity,
          width: width as any,
          height: height as any,
        },
        style,
      ]}
      className={cn(
        "bg-surface-altLight dark:bg-surface-altDark border border-border-light/40 dark:border-border-dark/40",
        roundedClasses,
        className
      )}
      {...props}
    />
  )
}
