import React from "react"
import { View, Text } from "react-native"
import { IconStar, IconStarFilled } from "@tabler/icons-react-native"

export interface RatingProps {
  value: number
  max?: number
  size?: number
  showValue?: boolean
  textColor?: string
}

export function Rating({
  value,
  max = 5,
  size = 14,
  showValue = false,
  textColor,
}: RatingProps) {
  const rounded = Math.round(value)

  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const isFilled = i < rounded
          if (isFilled) {
            return (
              <IconStarFilled
                key={i}
                size={size}
                color="#e8722a"
              />
            )
          }
          return (
            <IconStar
              key={i}
              size={size}
              color="#888888"
              strokeWidth={1.5}
            />
          )
        })}
      </View>

      {showValue && (
        <Text
          style={textColor ? { color: textColor } : undefined}
          className="text-xs font-bold text-content-light dark:text-content-dark ms-1"
        >
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  )
}
