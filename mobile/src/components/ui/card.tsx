import React from "react"
import { View, Pressable, type ViewProps, type PressableProps } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./button"

const cardVariants = cva(
  "rounded-3xl p-5 border",
  {
    variants: {
      variant: {
        default: "bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark",
        elevated: "bg-surface-light dark:bg-surface-dark border-border-light/60 dark:border-border-dark/60 shadow-md",
        muted: "bg-surface-altLight dark:bg-surface-altDark border-border-light dark:border-border-dark",
        gold: "bg-gold/10 border-gold/30",
        danger: "bg-red-500/10 border-red-500/30",
      },
      interactive: {
        true: "active:scale-[0.99] active:opacity-90",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

export interface CardProps
  extends ViewProps,
    VariantProps<typeof cardVariants> {
  onPress?: PressableProps["onPress"]
}

export function Card({
  className,
  variant,
  interactive = false,
  onPress,
  children,
  style,
  ...props
}: CardProps) {
  if (onPress || interactive) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(cardVariants({ variant, interactive: true }), className)}
        style={style}
        {...(props as PressableProps)}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View
      className={cn(cardVariants({ variant, interactive: false }), className)}
      style={style}
      {...props}
    >
      {children}
    </View>
  )
}
