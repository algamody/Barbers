import React from "react"
import { View, Text, type ViewProps } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./button"

const badgeVariants = cva(
  "inline-flex flex-row items-center justify-center rounded-full self-start",
  {
    variants: {
      variant: {
        default: "bg-primary text-white border border-primary/20",
        secondary: "bg-surface-altLight dark:bg-surface-altDark border border-border-light dark:border-border-dark",
        success: "bg-emerald-500/15 border border-emerald-500/30",
        danger: "bg-red-500/15 border border-red-500/30",
        outline: "bg-transparent border border-border-light dark:border-border-dark",
        gold: "bg-gold/15 border border-gold/40",
      },
      size: {
        sm: "px-2 py-0.5",
        default: "px-3 py-1",
        lg: "px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const badgeTextVariants = cva("font-bold text-center", {
  variants: {
    variant: {
      default: "text-white",
      secondary: "text-content-light dark:text-content-dark",
      success: "text-emerald-600 dark:text-emerald-400",
      danger: "text-red-600 dark:text-red-400",
      outline: "text-content-mutedLight dark:text-content-mutedDark",
      gold: "text-gold",
    },
    size: {
      sm: "text-[10px]",
      default: "text-xs",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  label?: string
  leadingIcon?: React.ReactNode
  icon?: React.ReactNode
}

export function Badge({
  className,
  variant,
  size,
  label,
  leadingIcon,
  icon,
  children,
  style,
  ...props
}: BadgeProps) {
  const actualIcon = leadingIcon ?? icon

  return (
    <View
      className={cn(badgeVariants({ variant, size }), className)}
      style={style}
      {...props}
    >
      {actualIcon ? <View className="me-1.5">{actualIcon}</View> : null}
      {label ? (
        <Text className={cn(badgeTextVariants({ variant, size }))}>{label}</Text>
      ) : typeof children === "string" ? (
        <Text className={cn(badgeTextVariants({ variant, size }))}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}
