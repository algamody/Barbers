import * as React from "react"
import { cn } from "@/lib/utils"
import { Lang } from "@/i18n"

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the status is open (true) or closed (false) */
  /** Current language ('ar' | 'en') - defaults to 'ar' */
  /** Custom text override if needed */
  /** Whether the indicator dot should pulse (defaults to false) */
  /** Size preset of the chip ('xs' | 'sm' | 'md' | 'lg') - defaults to 'sm' */
  /** Variant: 'default' uses themed CSS variables, 'glass' adds backdrop-blur for overlays on dark card media */
  isOpen: boolean
  lang?: Lang
  label?: string
  pulse?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  variant?: "default" | "glass"
}

export const StatusChip = React.forwardRef<HTMLDivElement, StatusChipProps>(
  (
    {
      isOpen,
      lang = "ar",
      label,
      pulse = false,
      size = "sm",
      variant = "default",
      className,
      ...props
    },
    ref,
  ) => {
    const text =
      label ??
      (isOpen
        ? lang === "ar"
          ? "مفتوح"
          : "Open"
        : lang === "ar"
          ? "مغلق"
          : "Closed")

    const sizeClasses = {
      xs: "px-2 py-0.5 text-[10px] gap-1",
      sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
      md: "px-3 py-1 text-xs gap-1.5",
      lg: "px-3.5 py-1.5 text-sm gap-2",
    }[size]

    const dotSize = {
      xs: "w-1.5 h-1.5",
      sm: "w-1.5 h-1.5",
      md: "w-2 h-2",
      lg: "w-2.5 h-2.5",
    }[size]

    const colorClasses =
      variant === "glass"
        ? isOpen
          ? "border-[var(--status-open-border)] bg-black/60 text-[var(--status-open-text)] backdrop-blur-md"
          : "border-[var(--status-closed-border)] bg-black/70 text-[var(--status-closed-text)] backdrop-blur-md"
        : isOpen
          ? "border-[var(--status-open-border)] bg-[var(--status-open-bg)] text-[var(--status-open-text)]"
          : "border-[var(--status-closed-border)] bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]"

    return (
      <div
        ref={ref}
        role="status"
        aria-label={text}
        className={cn(
          "inline-flex items-center rounded-full font-bold select-none transition-colors border",
          sizeClasses,
          colorClasses,
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "rounded-full shrink-0",
            dotSize,
            isOpen
              ? "bg-[var(--status-open-dot)]"
              : "bg-[var(--status-closed-dot)]",
            pulse && "animate-pulse",
          )}
        />
        <span className="leading-none">{text}</span>
      </div>
    )
  },
)

StatusChip.displayName = "StatusChip"

export default StatusChip
