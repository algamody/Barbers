import React, { useRef, useState, useEffect } from "react"
import { View, TextInput, Text, type NativeSyntheticEvent, type TextInputKeyPressEventData } from "react-native"
import { cn } from "./button"

export interface OtpInputProps {
  length?: number
  value?: string
  onChange?: (code: string) => void
  onComplete?: (code: string) => void
  error?: string | null
  autoFocus?: boolean
  disabled?: boolean
}

export function OtpInput({
  length = 4,
  value,
  onChange,
  onComplete,
  error,
  autoFocus = false,
  disabled = false,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => {
    if (value) {
      return value.split("").slice(0, length)
    }
    return Array(length).fill("")
  })

  const inputsRef = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    if (value !== undefined) {
      const arr = Array(length).fill("")
      value.split("").slice(0, length).forEach((char, i) => {
        arr[i] = char
      })
      setDigits(arr)
    }
  }, [value, length])

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      setTimeout(() => {
        inputsRef.current[0]?.focus()
      }, 150)
    }
  }, [autoFocus])

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, "")
    if (!cleaned) {
      // Clear current digit
      const next = [...digits]
      next[index] = ""
      setDigits(next)
      onChange?.(next.join(""))
      return
    }

    if (cleaned.length > 1) {
      // Handle paste
      const pasted = cleaned.slice(0, length).split("")
      const next = [...digits]
      pasted.forEach((char, i) => {
        if (i < length) next[i] = char
      })
      setDigits(next)
      const fullCode = next.join("")
      onChange?.(fullCode)
      const targetFocus = Math.min(pasted.length, length - 1)
      inputsRef.current[targetFocus]?.focus()
      if (next.every((d) => d !== "") && fullCode.length === length) {
        onComplete?.(fullCode)
      }
      return
    }

    const next = [...digits]
    next[index] = cleaned[cleaned.length - 1]
    setDigits(next)

    const fullCode = next.join("")
    onChange?.(fullCode)

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }

    if (next.every((d) => d !== "") && fullCode.length === length) {
      onComplete?.(fullCode)
    }
  }

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <View className="w-full items-center my-2">
      <View className="flex-row items-center justify-center gap-3">
        {Array.from({ length }).map((_, index) => {
          const isFilled = Boolean(digits[index])
          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputsRef.current[index] = ref
              }}
              value={digits[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              editable={!disabled}
              selectTextOnFocus
              className={cn(
                "w-14 h-15 rounded-2xl text-center text-2xl font-bold border",
                "bg-surface-altLight dark:bg-surface-altDark text-content-light dark:text-content-dark",
                error
                  ? "border-red-500"
                  : isFilled
                  ? "border-primary ring-1 ring-primary/40"
                  : "border-border-light dark:border-border-dark"
              )}
            />
          )
        })}
      </View>

      {error ? (
        <Text className="text-xs font-semibold text-red-500 mt-2 text-center">{error}</Text>
      ) : null}
    </View>
  )
}
