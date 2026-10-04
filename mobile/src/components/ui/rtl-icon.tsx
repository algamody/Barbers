import React from "react"
import { View, type ViewStyle, type StyleProp } from "react-native"
import { useAppLanguage } from "@/locals/LanguageContext"

export interface RTLIconProps {
  children?: React.ReactNode
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  className?: string
}

/**
 * Reusable RTL icon wrapper that automatically mirrors directional icons
 * (arrows, chevrons, forward/backward) in RTL layout via scaleX transform.
 */
export function RTLIcon({ children, icon, style, className }: RTLIconProps) {
  const { isRTL } = useAppLanguage()
  const content = children || icon

  return (
    <View
      className={className}
      style={[
        {
          transform: [{ scaleX: isRTL ? -1 : 1 }],
        },
        style,
      ]}
    >
      {content}
    </View>
  )
}
