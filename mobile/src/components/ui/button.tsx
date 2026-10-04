import React from "react"
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-2xl active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary border border-primary/20",
        outline: "bg-transparent border border-border-light dark:border-border-dark",
        secondary: "bg-surface-altLight dark:bg-surface-altDark border border-border-light dark:border-border-dark",
        ghost: "bg-transparent border-0",
        danger: "bg-red-600 border border-red-700",
        success: "bg-emerald-600 border border-emerald-700",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-9 px-3.5",
        lg: "h-14 px-6",
        icon: "w-11 h-11 p-0 rounded-full",
        "icon-sm": "w-9 h-9 p-0 rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "opacity-45 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      disabled: false,
    },
  }
)

const buttonTextVariants = cva("font-bold text-center", {
  variants: {
    variant: {
      default: "text-white",
      outline: "text-content-light dark:text-content-dark",
      secondary: "text-content-light dark:text-content-dark",
      ghost: "text-content-light dark:text-content-dark",
      danger: "text-white",
      success: "text-white",
    },
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base font-extrabold",
      icon: "text-xs",
      "icon-sm": "text-[10px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  label?: string
  loading?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** @deprecated Use leadingIcon instead */
  leftIcon?: React.ReactNode
  /** @deprecated Use trailingIcon instead */
  rightIcon?: React.ReactNode
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export function Button({
  children,
  label,
  variant,
  size,
  fullWidth,
  disabled,
  loading = false,
  leadingIcon,
  trailingIcon,
  leftIcon,
  rightIcon,
  icon,
  className,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  const actualLeading = leadingIcon ?? leftIcon ?? icon
  const actualTrailing = trailingIcon ?? rightIcon

  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, fullWidth, disabled: isDisabled }), className)}
      disabled={isDisabled}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" || variant === "secondary" ? "#e8722a" : "#ffffff"}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {actualLeading && <View className="me-2.5">{actualLeading}</View>}
          {label ? (
            <Text style={textStyle} className={cn(buttonTextVariants({ variant, size }))}>
              {label}
            </Text>
          ) : typeof children === "string" ? (
            <Text style={textStyle} className={cn(buttonTextVariants({ variant, size }))}>
              {children}
            </Text>
          ) : (
            children
          )}
          {actualTrailing && <View className="ms-2.5">{actualTrailing}</View>}
        </View>
      )}
    </Pressable>
  )
}
