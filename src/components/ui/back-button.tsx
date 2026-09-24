import * as React from "react"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

export interface BackButtonProps extends Omit<ButtonProps, "children"> {
  /** Optional direction override ("rtl" | "ltr"). If omitted, resolved from lang or DOM */
  dir?: "rtl" | "ltr"
  /** Optional language ('ar' | 'en') to determine direction */
  lang?: string
  /** Size of the arrow icon in pixels (default: 18) */
  iconSize?: number
  /** Stroke width of the arrow icon (default: 2) */
  iconStroke?: number
  /** Accessibility title / tooltip (default: "رجوع" in Arabic, "Back" in English) */
  title?: string
}

/**
 * Reusable BackButton component for the entire project.
 * Automatically mirrors the arrow icon based on direction (RTL -> arrow right, LTR -> arrow left).
 */
export const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  (
    {
      dir,
      lang,
      variant = "outline",
      size = "icon-sm",
      iconSize = 18,
      iconStroke = 2,
      className,
      title,
      type = "button",
      ...props
    },
    ref,
  ) => {
    // Determine RTL/LTR
    const isRtl = React.useMemo(() => {
      if (dir) return dir === "rtl"
      if (lang) return lang === "ar"
      if (typeof document !== "undefined") {
        return (
          document.documentElement.dir === "rtl" ||
          document.body?.getAttribute("dir") === "rtl"
        )
      }
      return true // Default to RTL for the app
    }, [dir, lang])

    const defaultTitle = isRtl ? "رجوع" : "Back"
    const ariaLabel = title || defaultTitle

    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        size={size}
        aria-label={ariaLabel}
        title={title || defaultTitle}
        className={cn(
          "rounded-full text-xs font-semibold cursor-pointer hover:bg-[var(--secondary)] shrink-0 transition-transform active:scale-95",
          className,
        )}
        {...props}
      >
        {isRtl ? (
          <IconArrowRight size={iconSize} stroke={iconStroke} />
        ) : (
          <IconArrowLeft size={iconSize} stroke={iconStroke} />
        )}
      </Button>
    )
  },
)

BackButton.displayName = "BackButton"
