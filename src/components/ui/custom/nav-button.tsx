import React from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

export interface NavButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Visual variant:
   * - "card": A card/tile container with border, suitable for dashboard stats like wallet/points
   * - "row": A list item row with border-b, suitable for settings and navigation menus
   * - "default": Standard solid primary button with side arrow
   * - "secondary": Secondary styled button with side arrow
   * - "outline": Bordered button with side arrow
   * - "ghost": Transparent background with hover
   */
  /** Direction override ("rtl" | "ltr"). If omitted, detected from document or parent */
  /** Optional icon to display before content */
  /** For card variant: title/label at top */
  /** For card variant: main big value/number */
  /** For card variant: subtext under the value */
  /** Size of the chevron arrow in pixels (default: 16) */
  /** Whether to show the chevron arrow (default: true) */
  /** Custom className for the chevron icon container */
  /** Whether the element takes 100% width (default: true for card and row, false for button) */
  /** Faint decorative background icon for card variant */
  /** Custom className for the background icon container */
  variant?: "card" | "row" | "default" | "secondary" | "outline" | "ghost"
  dir?: "rtl" | "ltr"
  icon?: React.ReactNode
  label?: React.ReactNode
  value?: React.ReactNode
  subtext?: React.ReactNode
  bgIcon?: React.ReactNode
  bgIconClassName?: string
  arrowSize?: number
  showArrow?: boolean
  arrowClassName?: string
  fullWidth?: boolean
}

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  (
    {
      variant = "default",
      dir,
      icon,
      label,
      value,
      subtext,
      bgIcon,
      bgIconClassName = "",
      arrowSize = 16,
      showArrow = true,
      arrowClassName = "",
      fullWidth,
      children,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    // Detect RTL from prop, or DOM document
    const isRtl =
      dir === "rtl" ||
      (typeof document !== "undefined" &&
        (document.documentElement.dir === "rtl" ||
          document.body?.getAttribute("dir") === "rtl"))

    const arrowIcon = isRtl ? (
      <IconChevronLeft size={arrowSize} stroke={2.2} />
    ) : (
      <IconChevronRight size={arrowSize} stroke={2.2} />
    )

    // Variant 1: Card / Tile (e.g. Wallet, Points, Stats)
    if (variant === "card") {
      const isFull = fullWidth !== false
      return (
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          dir={isRtl ? "rtl" : "ltr"}
          className={`group relative overflow-hidden rounded-2xl px-4 py-4 border border-[var(--border)] bg-[var(--card)] cursor-pointer hover:bg-[var(--secondary)]/30 transition-all active:scale-[0.98] text-start focus:outline-none select-none disabled:opacity-50 disabled:pointer-events-none ${
            isFull ? "w-full" : ""
          } ${className}`}
          {...props}
        >
          {/* Faint background decorative watermark icon positioned in the empty area away from the arrow */}
          {bgIcon && (
            <div
              className={`absolute pointer-events-none transition-transform duration-300 group-hover:scale-105 select-none ${
                isRtl ? "left-10" : "right-10"
              } top-1/2 -translate-y-1/2 text-[var(--foreground)]/8 dark:text-[var(--foreground)]/12 ${bgIconClassName}`}
              aria-hidden="true"
            >
              {bgIcon}
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between w-full h-full gap-2">
            <div className="min-w-0 flex-1">
              {label && (
                <p className="text-xs tracking-widest uppercase mb-1 text-[var(--muted-foreground)] font-semibold truncate">
                  {label}
                </p>
              )}
              {value !== undefined && (
                <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums truncate">
                  {value}
                </p>
              )}
              {subtext && (
                <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                  {subtext}
                </p>
              )}
              {children}
            </div>

            {showArrow && (
              <div
                className={`shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors ${arrowClassName}`}
              >
                {arrowIcon}
              </div>
            )}
          </div>
        </button>
      )
    }

    // Variant 2: Row / List Item (e.g. Profile options, Settings items)
    if (variant === "row") {
      const isFull = fullWidth !== false
      return (
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          dir={isRtl ? "rtl" : "ltr"}
          className={`group flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40 cursor-pointer text-start focus:outline-none disabled:opacity-50 disabled:pointer-events-none ${
            isFull ? "w-full" : ""
          } ${className}`}
          {...props}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {icon && <span className="shrink-0">{icon}</span>}
            <div className="min-w-0 flex-1">
              {label && (
                <span className="text-sm font-medium text-[var(--foreground)] block truncate">
                  {label}
                </span>
              )}
              {children}
            </div>
          </div>

          {showArrow && (
            <div
              className={`shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors ${arrowClassName}`}
            >
              {arrowIcon}
            </div>
          )}
        </button>
      )
    }

    // Variant 3: Action Buttons (default, secondary, outline, ghost)
    const baseBtnStyles =
      "h-11 px-5 rounded-2xl font-bold inline-flex items-center justify-between gap-3 shadow-xs cursor-pointer transition-all active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:pointer-events-none"

    const variantStyles = {
      default: "bg-[var(--primary)] text-white hover:opacity-95",
      secondary:
        "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80",
      outline:
        "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]/40",
      ghost:
        "bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]/40 shadow-none",
    }[variant]

    const isFull = fullWidth === true

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        dir={isRtl ? "rtl" : "ltr"}
        className={`${baseBtnStyles} ${variantStyles} ${
          isFull ? "w-full" : ""
        } ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{children || label}</span>
        </div>

        {showArrow && (
          <div className={`shrink-0 opacity-80 ${arrowClassName}`}>
            {arrowIcon}
          </div>
        )}
      </button>
    )
  },
)

NavButton.displayName = "NavButton"

/**
 * Convenient shorthand component for NavButton with variant="card"
 */
export const NavCard = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  (props, ref) => <NavButton ref={ref} variant="card" {...props} />,
)

NavCard.displayName = "NavCard"
