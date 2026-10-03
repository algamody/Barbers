import React, { createContext, useContext, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { type Lang, setAppLanguage } from "./i18n"
import { defaultStorage } from "../storage/asyncStorageAdapter"
import { STORAGE_KEYS } from "../constants"

interface LanguageContextValue {
  lang: Lang
  isRTL: boolean
  setLanguage: (lang: Lang) => Promise<void>
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const [lang, setLangState] = useState<Lang>("ar")

  useEffect(() => {
    async function loadSavedLang() {
      const saved = await defaultStorage.getItem(STORAGE_KEYS.LANG)
      if (saved === "ar" || saved === "en") {
        setLangState(saved)
        setAppLanguage(saved)
      } else {
        setAppLanguage("ar")
      }
    }
    loadSavedLang()
  }, [])

  const setLanguage = async (newLang: Lang) => {
    setLangState(newLang)
    setAppLanguage(newLang)
    await defaultStorage.setItem(STORAGE_KEYS.LANG, newLang)
  }

  const isRTL = lang === "ar"

  return (
    <LanguageContext.Provider value={{ lang, isRTL, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useAppLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useAppLanguage must be used within LanguageProvider")
  }
  return ctx
}
