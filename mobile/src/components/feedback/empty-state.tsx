import React from "react"
import { View, Text, type ViewProps } from "react-native"
import { cn } from "../ui/button"

export function EmptyState({ children, className, style, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "items-center justify-center p-8 rounded-3xl border border-dashed border-border-light dark:border-border-dark my-4",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  )
}

export function EmptyStateIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View
      className={cn(
        "w-16 h-16 rounded-3xl bg-surface-altLight dark:bg-surface-altDark items-center justify-center mb-4 border border-border-light dark:border-border-dark",
        className
      )}
    >
      {children}
    </View>
  )
}

export function EmptyStateTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      className={cn(
        "text-base font-bold text-content-light dark:text-content-dark text-center mb-1.5",
        className
      )}
    >
      {children}
    </Text>
  )
}

export function EmptyStateDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      className={cn(
        "text-xs text-content-mutedLight dark:text-content-mutedDark text-center leading-relaxed max-w-xs mb-4",
        className
      )}
    >
      {children}
    </Text>
  )
}

export function EmptyStateAction({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={cn("mt-2", className)}>{children}</View>
}
