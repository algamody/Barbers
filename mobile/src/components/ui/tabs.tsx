import React, { createContext, useContext } from "react"
import { View, Text, Pressable, ScrollView, type ViewProps } from "react-native"
import { cn } from "./button"

interface TabsContextValue {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export interface TabsProps extends ViewProps {
  value: string
  onValueChange: (val: string) => void
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, children, className, style, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View className={cn("w-full", className)} style={style} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
  scrollable = false,
}: {
  children: React.ReactNode
  className?: string
  scrollable?: boolean
}) {
  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        className={cn("flex-row p-1 rounded-2xl bg-surface-altLight dark:bg-surface-altDark my-2", className)}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View
      className={cn(
        "flex-row p-1 rounded-2xl bg-surface-altLight dark:bg-surface-altDark my-2 items-center justify-between",
        className
      )}
    >
      {children}
    </View>
  )
}

export function TabsTrigger({
  value,
  label,
  icon,
  className,
}: {
  value: string
  label: string
  icon?: React.ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used inside Tabs")

  const isActive = context.value === value

  return (
    <Pressable
      onPress={() => context.onValueChange(value)}
      className={cn(
        "flex-1 flex-row items-center justify-center py-2 px-3 rounded-xl",
        isActive
          ? "bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark"
          : "bg-transparent border border-transparent",
        className
      )}
    >
      {icon ? <View className="me-1.5">{icon}</View> : null}
      <Text
        className={cn(
          "text-xs font-bold",
          isActive
            ? "text-primary"
            : "text-content-mutedLight dark:text-content-mutedDark"
        )}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used inside Tabs")

  if (context.value !== value) return null

  return <View className={cn("w-full pt-3", className)}>{children}</View>
}
