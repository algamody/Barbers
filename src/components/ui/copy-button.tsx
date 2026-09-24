import * as React from "react"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Lang } from "@/i18n"
import { showSnackbar } from "./snackbar"

/**
 * Robust cross-browser clipboard utility with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Clipboard API might be restricted in some iframes or older browsers
  }

  try {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-9999px"
    textArea.style.top = "-9999px"
    textArea.style.opacity = "0"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)
    return successful
  } catch {
    return false
  }
}

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onCopy"> {
  /** The text string to copy to the clipboard */
  /** Active language for localized titles and feedback */
  /** Visual variant matching the design system */
  /** Size of the button */
  /** Whether to show a text label alongside the icon */
  /** Custom label when not copied */
  /** Custom label when copied */
  /** Duration in ms for the copied state before resetting (default: 2000ms) */
  /** Whether to trigger a snackbar alert when copied */
  /** Custom snackbar message when copied */
  /** Callback fired after successful copying */
  text: string
  lang?: Lang
  variant?: "subtle" | "solid" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  labelCopy?: string
  labelCopied?: string
  duration?: number
  showToast?: boolean
  toastMessage?: string
  onCopy?: (text: string) => void
}

/**
 * Unified CopyButton Component
 * Reusable copy tool extracted from the ID copy button in Wallet.
 * Features smooth copy-to-clipboard, animated IconCheck confirmation,
 * localized tooltips, and optional toast notifications.
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      text,
      lang = "ar",
      variant = "subtle",
      size = "sm",
      showLabel = false,
      labelCopy,
      labelCopied,
      duration = 2000,
      showToast = false,
      toastMessage,
      onCopy,
      className,
      title,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = React.useState(false)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (onClick) onClick(e)

      const success = await copyToClipboard(text)
      if (success) {
        setCopied(true)
        if (onCopy) onCopy(text)

        if (showToast) {
          showSnackbar({
            title:
              toastMessage ||
              (lang === "ar"
                ? "تم النسخ إلى الحافظة بنجاح"
                : "Copied to clipboard successfully"),
            type: "success",
          })
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
        }, duration)
      }
    }

    // Localized defaults
    const defaultCopyTitle = lang === "ar" ? "نسخ" : "Copy"
    const defaultCopiedTitle =
      lang === "ar" ? "تم النسخ بنجاح" : "Copied successfully"
    const resolvedTitle =
      title || (copied ? defaultCopiedTitle : defaultCopyTitle)

    const resolvedLabelCopy = labelCopy || (lang === "ar" ? "نسخ" : "Copy")
    const resolvedLabelCopied =
      labelCopied || (lang === "ar" ? "تم النسخ" : "Copied")

    // Variant classes
    const variantClasses = {
      subtle:
        "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 active:bg-[var(--primary)]/25",
      solid:
        "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 active:bg-[var(--primary)]/95 shadow-xs",
      ghost:
        "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50",
      outline:
        "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]/40",
    }[variant]

    // Size specs
    const sizeConfig = {
      sm: {
        icon: 14,
        stroke: 2,
        button: showLabel
          ? "h-7 px-2.5 text-xs rounded-lg gap-1.5"
          : "w-7 h-7 rounded-lg",
      },
      md: {
        icon: 16,
        stroke: 2,
        button: showLabel
          ? "h-8 px-3 text-xs rounded-xl gap-1.5"
          : "w-8 h-8 rounded-xl",
      },
      lg: {
        icon: 18,
        stroke: 2.2,
        button: showLabel
          ? "h-10 px-3.5 text-sm rounded-xl gap-2"
          : "w-10 h-10 rounded-xl",
      },
    }[size]

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        title={resolvedTitle}
        aria-label={resolvedTitle}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all active:scale-90 cursor-pointer select-none shrink-0",
          variantClasses,
          sizeConfig.button,
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "transition-transform duration-200 flex items-center justify-center",
            copied ? "scale-110" : "scale-100",
          )}
        >
          {copied ? (
            <IconCheck
              size={sizeConfig.icon}
              stroke={2.5}
              className="text-emerald-500 animate-in zoom-in-50 duration-150"
            />
          ) : (
            <IconCopy size={sizeConfig.icon} stroke={sizeConfig.stroke} />
          )}
        </span>

        {showLabel && (
          <span className="font-sans font-bold transition-colors">
            {copied ? resolvedLabelCopied : resolvedLabelCopy}
          </span>
        )}
      </button>
    )
  },
)

CopyButton.displayName = "CopyButton"

export default CopyButton
