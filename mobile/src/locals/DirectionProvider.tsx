import React, { createContext, useContext } from "react"
import { View, type ViewStyle } from "react-native"
import { useAppLanguage } from "./LanguageContext"

interface DirectionContextValue {
  direction: "rtl" | "ltr"
  isRTL: boolean
}

const DirectionContext = createContext<DirectionContextValue>({
  direction: "rtl",
  isRTL: true,
})

/**
 * Root Direction Provider providing dynamic, single-source-of-truth RTL/LTR flipping.
 * Injects `direction: 'rtl' | 'ltr'` directly into the root View container so that
 * any language change in i18next triggers an instantaneous layout flip without app reloads.
 */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { isRTL } = useAppLanguage()
  const direction: "rtl" | "ltr" = isRTL ? "rtl" : "ltr"

  return (
    <DirectionContext.Provider value={{ direction, isRTL }}>
      <View style={{ flex: 1, direction }}>
        {children}
      </View>
    </DirectionContext.Provider>
  )
}

export function useDirection(): DirectionContextValue {
  return useContext(DirectionContext)
}
