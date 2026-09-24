import React from "react"
import { IconStarFilled } from "@tabler/icons-react"

export interface RatingProps {
  /** Rating score value (e.g. 4.8 or 5) */
  value?: number | string | null
  /** Display format:
   * - "badge": Single star icon + score text (e.g. [★] 4.8) (Default)
   * - "stars": Row of stars (filled/unfilled) (e.g. ★★★★★)
   * - "interactive": Clickable row of stars for submitting reviews
   */
  variant?: "badge" | "stars" | "interactive"
  /** Maximum number of stars (default: 5) */
  max?: number
  /** Star icon size in pixels */
  size?: number
  /** Whether to show the score text (default: true for badge, false for stars) */
  showScore?: boolean
  /** Callback when a star is clicked in interactive variant */
  onChange?: (val: number) => void
  /** Custom wrapper class */
  className?: string
  /** Custom star color class (defaults to unified amber gold) */
  starColor?: string
  /** Custom text class */
  textClassName?: string
}

export const UNIFIED_STAR_COLOR = "text-amber-500 dark:text-amber-400"

export function Rating({
  value = 0,
  variant = "badge",
  max = 5,
  size,
  showScore = variant === "badge",
  onChange,
  className = "",
  starColor = UNIFIED_STAR_COLOR,
  textClassName,
}: RatingProps) {
  const numValue =
    typeof value === "string" ? parseFloat(value) || 0 : (value ?? 0)
  const defaultSize =
    variant === "interactive" ? 28 : variant === "stars" ? 12 : 12
  const starSize = size ?? defaultSize

  if (variant === "interactive") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {Array.from({ length: max }).map((_, i) => {
          const starVal = i + 1
          const isFilled = starVal <= numValue
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => onChange?.(starVal)}
              className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none"
            >
              <IconStarFilled
                size={starSize}
                className={
                  isFilled
                    ? `${starColor} shrink-0 transition-colors`
                    : "text-zinc-300 dark:text-zinc-700 shrink-0 transition-colors"
                }
              />
            </button>
          )
        })}
        {showScore && (
          <span
            className={`text-xs font-bold text-[var(--foreground)] ms-2 ${
              textClassName || ""
            }`}
          >
            {numValue} / {max}
          </span>
        )}
      </div>
    )
  }

  if (variant === "stars") {
    return (
      <div className={`inline-flex items-center gap-0.5 ${className}`}>
        {Array.from({ length: max }).map((_, i) => {
          const isFilled = i < Math.round(numValue)
          return (
            <IconStarFilled
              key={i}
              size={starSize}
              className={
                isFilled
                  ? `${starColor} shrink-0`
                  : "text-zinc-300 dark:text-zinc-700 shrink-0"
              }
            />
          )
        })}
        {showScore && (
          <span
            className={`text-xs font-bold text-[var(--foreground)] ms-1.5 ${
              textClassName || ""
            }`}
          >
            {numValue}
          </span>
        )}
      </div>
    )
  }

  // Default: "badge" (Single unified star + number)
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold text-xs ${className}`}
    >
      <IconStarFilled size={starSize} className={`${starColor} shrink-0`} />
      {showScore && (
        <span
          className={`leading-none ${
            textClassName !== undefined
              ? textClassName
              : "text-[var(--foreground)]"
          }`}
        >
          {numValue}
        </span>
      )}
    </span>
  )
}
