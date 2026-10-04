import React, { useState } from "react"
import { Pressable, Text, View } from "react-native"
import * as Clipboard from "expo-clipboard"
import { IconCopy, IconCheck } from "@tabler/icons-react-native"
import { useAppLanguage } from "@/locals/LanguageContext"
import { cn } from "./button"

export interface CopyButtonProps {
  text: string
  label?: string
  copiedLabel?: string
  size?: number
  className?: string
  onCopied?: () => void
}

export function CopyButton({
  text,
  label,
  copiedLabel,
  size = 16,
  className,
  onCopied,
}: CopyButtonProps) {
  const { t } = useAppLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text)
    setCopied(true)
    onCopied?.()
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const effectiveCopiedLabel = copiedLabel ?? t("Copied!")

  return (
    <Pressable
      onPress={handleCopy}
      className={cn(
        "flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-altLight dark:bg-surface-altDark active:opacity-75",
        className
      )}
    >
      {copied ? (
        <IconCheck size={size} color="#10b981" strokeWidth={2.5} />
      ) : (
        <IconCopy size={size} color="#e8722a" strokeWidth={2} />
      )}
      <Text
        className={cn(
          "text-xs font-semibold",
          copied ? "text-emerald-500" : "text-content-light dark:text-content-dark"
        )}
      >
        {copied ? effectiveCopiedLabel : label || text}
      </Text>
    </Pressable>
  )
}
