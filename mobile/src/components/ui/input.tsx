import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  type TextInputProps,
} from "react-native"
import { cn } from "./button"

export interface InputProps extends TextInputProps {
  label?: string
  error?: string | null
  helperText?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** @deprecated Use leadingIcon instead */
  leftIcon?: React.ReactNode
  /** @deprecated Use trailingIcon instead */
  rightIcon?: React.ReactNode
  containerClassName?: string
}

export function Input({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const actualLeading = leadingIcon ?? leftIcon
  const actualTrailing = trailingIcon ?? rightIcon

  return (
    <View className={cn("w-full mb-3", containerClassName)}>
      {label && (
        <Text className="text-xs font-semibold text-content-mutedLight dark:text-content-mutedDark mb-1.5 px-1 text-start">
          {label}
        </Text>
      )}

      <View
        className={cn(
          "flex-row items-center h-12 px-4 rounded-2xl border bg-surface-altLight dark:bg-surface-altDark",
          error
            ? "border-red-500"
            : isFocused
            ? "border-primary"
            : "border-border-light dark:border-border-dark"
        )}
      >
        {actualLeading && <View className="me-2.5">{actualLeading}</View>}

        <TextInput
          className={cn(
            "flex-1 text-sm font-medium text-content-light dark:text-content-dark h-full text-start",
            className
          )}
          placeholderTextColor="#888888"
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          style={style}
          {...props}
        />

        {actualTrailing && <View className="ms-2.5">{actualTrailing}</View>}
      </View>

      {error ? (
        <Text className="text-xs font-medium text-red-500 mt-1 px-1 text-start">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-content-mutedLight dark:text-content-mutedDark mt-1 px-1 text-start">
          {helperText}
        </Text>
      ) : null}
    </View>
  )
}
