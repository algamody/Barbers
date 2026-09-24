import * as React from "react"
import { cn } from "@/lib/utils"

export type NotificationDotPresetColor = "primary" | "emerald" | "green" | "success" | "amber" | "orange" | "warning" | "rose" | "red" | "destructive" | "blue" | "sky" | "info" | "purple" | "violet" | "zinc" | "gray" | "white"

export type NotificationDotColor = NotificationDotPresetColor | string & {}

export type NotificationDotSize = "xs" | "sm" | "md" | "lg" | "xl"

export type NotificationDotSpeed = "fast" | "normal" | "slow"

export type NotificationDotPlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-end" | "top-start" | "bottom-end" | "bottom-start" | "center" | "inline"

export interface NotificationDotProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Whether the notification dot is visible (defaults to true) */
  visible?: boolean
  /** Whether to animate with pulse/radar effect (defaults to true) */
  pulse?: boolean
  /** Speed of pulse animation ('fast' | 'normal' | 'slow') */
  speed?: NotificationDotSpeed
  /**
   * Color of the notification dot.
   * Accepts preset names ('primary', 'emerald', 'amber', 'rose', 'red', 'blue', 'purple', etc.),
   * Tailwind classes ('bg-teal-500'), or CSS color values ('#10b981', 'rgb(...)').
   */
  color?: NotificationDotColor
  /** Size preset of the dot */
  size?: NotificationDotSize
  /** Relative placement when used inside a relative container or wrapping children */
  placement?: NotificationDotPlacement
  /** Ring style for separation from backgrounds (defaults to ring-2 ring-[var(--card)]) */
  ringClassName?: string
  /** Custom background/color class override */
  colorClassName?: string
  /** Container class if wrapping children */
  containerClassName?: string
  /** Optional wrapped children */
  children?: React.ReactNode
}

const presetColorMap: Record<string, {
  bgClass: string
  colorValue: string
}> = {
  primary: {
    bgClass: "bg-[var(--primary)] text-[var(--primary)]",
    colorValue: "var(--primary)",
  },
  emerald: {
    bgClass: "bg-emerald-500 text-emerald-500",
    colorValue: "#10b981",
  },
  green: {
    bgClass: "bg-emerald-500 text-emerald-500",
    colorValue: "#10b981",
  },
  success: {
    bgClass: "bg-emerald-500 text-emerald-500",
    colorValue: "#10b981",
  },
  amber: {
    bgClass: "bg-amber-500 text-amber-500",
    colorValue: "#f59e0b",
  },
  orange: {
    bgClass: "bg-orange-500 text-orange-500",
    colorValue: "#f97316",
  },
  warning: {
    bgClass: "bg-amber-500 text-amber-500",
    colorValue: "#f59e0b",
  },
  rose: {
    bgClass: "bg-rose-500 text-rose-500",
    colorValue: "#f43f5e",
  },
  red: {
    bgClass: "bg-red-500 text-red-500",
    colorValue: "#ef4444",
  },
  destructive: {
    bgClass: "bg-red-500 text-red-500",
    colorValue: "#ef4444",
  },
  blue: {
    bgClass: "bg-sky-500 text-sky-500",
    colorValue: "#0ea5e9",
  },
  sky: {
    bgClass: "bg-sky-500 text-sky-500",
    colorValue: "#0ea5e9",
  },
  info: {
    bgClass: "bg-sky-500 text-sky-500",
    colorValue: "#0ea5e9",
  },
  purple: {
    bgClass: "bg-purple-500 text-purple-500",
    colorValue: "#a855f7",
  },
  violet: {
    bgClass: "bg-violet-500 text-violet-500",
    colorValue: "#8b5cf6",
  },
  zinc: {
    bgClass: "bg-zinc-400 text-zinc-400",
    colorValue: "#a1a1aa",
  },
  gray: {
    bgClass: "bg-zinc-400 text-zinc-400",
    colorValue: "#a1a1aa",
  },
  white: {
    bgClass: "bg-white text-white",
    colorValue: "#ffffff",
  },
}

const sizeMap: Record<NotificationDotSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-3.5 w-3.5",
}

const placementMap: Record<NotificationDotPlacement, string> = {
  "top-right": "absolute -top-0.5 -right-0.5",
  "top-left": "absolute -top-0.5 -left-0.5",
  "top-end": "absolute -top-0.5 end-0",
  "top-start": "absolute -top-0.5 start-0",
  "bottom-right": "absolute -bottom-0.5 -right-0.5",
  "bottom-left": "absolute -bottom-0.5 -left-0.5",
  "bottom-end": "absolute -bottom-0.5 end-0",
  "bottom-start": "absolute -bottom-0.5 start-0",
  center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  inline: "relative inline-flex items-center shrink-0 mx-1",
}

/**
 * Reusable NotificationDot Component
 * Displays a vibrant, animated indicator with high-visibility blinking/radar effects
 * to immediately draw user attention to new updates, confirmed slots, or unread events.
 *
 * Supports arbitrary colors (presets, Tailwind classes, or hex/CSS strings), multiple sizes,
 * placements, and optional children wrapping.
 */
export const NotificationDot =
  React.forwardRef<HTMLSpanElement, NotificationDotProps>(
    (
      {
        visible = true,
        pulse = true,
        speed = "fast",
        color = "primary",
        size = "md",
        placement = "top-right",
        ringClassName,
        colorClassName,
        containerClassName,
        className,
        style,
        children,
        ...props
      },
      ref,
    ) => {
      if (!visible) {
        return children ? <>{children}</> : null
      }

      const isCustomCssColor =
        typeof color === "string" &&
        (color.startsWith("#") ||
          color.startsWith("rgb") ||
          color.startsWith("hsl") ||
          color.startsWith("var("))

      const isCustomBgClass =
        typeof color === "string" && color.startsWith("bg-")

      const preset = presetColorMap[color] || presetColorMap.primary

      const colorClass = colorClassName
        ? colorClassName
        : isCustomBgClass
          ? color
          : isCustomCssColor
            ? ""
            : preset.bgClass

      const colorStyle: React.CSSProperties | undefined = isCustomCssColor
        ? { backgroundColor: color, color }
        : undefined

      const radarStyle: React.CSSProperties | undefined = isCustomCssColor
        ? { backgroundColor: color }
        : undefined

      const resolvedSize = sizeMap[size]
      const resolvedPlacement = placementMap[placement]
      const resolvedRing = ringClassName ?? "ring-2 ring-[var(--card)]"

      const dotElement = (
        <span
          ref={ref}
          role="status"
          aria-label={props["aria-label"] || "Notification indicator"}
          className={cn(
            "pointer-events-none z-20 flex items-center justify-center",
            resolvedPlacement,
            className,
          )}
          style={style}
          {...props}
        >
          <span
            className={cn(
              "relative inline-flex rounded-full shadow-xs",
              resolvedSize,
              colorClass,
              resolvedRing,
              pulse &&
                (speed === "normal"
                  ? "animate-pulse"
                  : speed === "slow"
                    ? "animate-pulse duration-3000"
                    : "animate-pulse-dot"),
            )}
            style={colorStyle}
          />
        </span>
      )

      if (children) {
        return (
          <span className={cn("relative inline-flex", containerClassName)}>
            {children}
            {dotElement}
          </span>
        )
      }

      return dotElement
    },
  )

NotificationDot.displayName = "NotificationDot"

export default NotificationDot
