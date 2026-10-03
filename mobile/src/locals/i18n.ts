import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { I18nManager } from "react-native"
import ar from "./ar/translation.json"
import en from "./en/translation.json"

export type Lang = "ar" | "en"

export const resources = {
  ar: { translation: ar },
  en: { translation: en },
} as const

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: "ar",
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
})

export function setAppLanguage(lang: Lang) {
  i18n.changeLanguage(lang)
  const isRTL = lang === "ar"
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL)
    I18nManager.forceRTL(isRTL)
  }
}

export default i18n
