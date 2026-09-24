import * as React from "react"
import { cn } from "@/lib/utils"

export type NotificationDotPresetColor =
  | "rose"
  | "primary"
  | "emerald"
  | "green"
  | "success"
  | "amber"
  | "orange"
  | "warning"
  | "red"
  | "destructive"
  | "blue"
  | "sky"
  | "info"
  | "purple"
  | "violet"
  | "zinc"
  | "gray"
  | "white"

export type NotificationDotColor = NotificationDotPresetColor | (string & {})

export type NotificationDotSize = "xs" | "sm" | "md" | "lg" | "xl"

export type NotificationDotSpeed = "fast" | "normal" | "slow"

export type NotificationDotPlacement =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-end"
  | "top-start"
  | "bottom-end"
  | "bottom-start"
  | "center"
  | "inline"

export interface NotificationDotProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Whether the notification dot is visible (defaults to true) */
  visible?: boolean
  /** Whether to animate with pulse/radar effect (defaults to false - static) */
  pulse?: boolean
  /** Optional badge count or text content (e.g. 2, '9+', etc.) */
  count?: number | string
  /** Speed of pulse animation ('fast' | 'normal' | 'slow') */
  speed?: NotificationDotSpeed
  /**
   * Color of the notification dot.
   * Defaults to 'rose' (matching the favorites heart badge: bg-rose-500).
   */
  color?: NotificationDotColor
  /** Size preset of the dot */
  size?: NotificationDotSize
  /** Relative placement when used inside a relative container or wrapping children */
  placement?: NotificationDotPlacement
  /** Ring style for separation from backgrounds (optional) */
  ringClassName?: string
  /** Custom background/color class override */
  colorClassName?: string
  /** Container class if wrapping children */
  containerClassName?: string
  /** Optional wrapped children */
  children?: React.ReactNode
}

const presetColorMap: Record<
  string,
  {
    bgClass: string
    colorValue: string
  }
> = {
  rose: {
    bgClass: "bg-rose-500 text-white",
    colorValue: "#f43f5e",
  },
  primary: {
    bgClass: "bg-rose-500 text-white",
    colorValue: "#f43f5e",
  },
  red: {
    bgClass: "bg-rose-500 text-white",
    colorValue: "#f43f5e",
  },
  destructive: {
    bgClass: "bg-rose-500 text-white",
    colorValue: "#f43f5e",
  },
  emerald: {
    bgClass: "bg-emerald-500 text-white",
    colorValue: "#10b981",
  },
  green: {
    bgClass: "bg-emerald-500 text-white",
    colorValue: "#10b981",
  },
  success: {
    bgClass: "bg-emerald-500 text-white",
    colorValue: "#10b981",
  },
  amber: {
    bgClass: "bg-amber-500 text-white",
    colorValue: "#f59e0b",
  },
  orange: {
    bgClass: "bg-orange-500 text-white",
    colorValue: "#f97316",
  },
  warning: {
    bgClass: "bg-amber-500 text-white",
    colorValue: "#f59e0b",
  },
  blue: {
    bgClass: "bg-sky-500 text-white",
    colorValue: "#0ea5e9",
  },
  sky: {
    bgClass: "bg-sky-500 text-white",
    colorValue: "#0ea5e9",
  },
  info: {
    bgClass: "bg-sky-500 text-white",
    colorValue: "#0ea5e9",
  },
  purple: {
    bgClass: "bg-purple-500 text-white",
    colorValue: "#a855f7",
  },
  violet: {
    bgClass: "bg-violet-500 text-white",
    colorValue: "#8b5cf6",
  },
  zinc: {
    bgClass: "bg-zinc-400 text-white",
    colorValue: "#a1a1aa",
  },
  gray: {
    bgClass: "bg-zinc-400 text-white",
    colorValue: "#a1a1aa",
  },
  white: {
    bgClass: "bg-white text-zinc-900",
    colorValue: "#ffffff",
  },
}

const sizeMap: Record<NotificationDotSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
}

const placementMap: Record<NotificationDotPlacement, string> = {
  "top-right": "absolute -top-1 -right-1",
  "top-left": "absolute -top-1 -left-1",
  "top-end": "absolute -top-1 end-0",
  "top-start": "absolute -top-1 start-0",
  "bottom-right": "absolute -bottom-1 -right-1",
  "bottom-left": "absolute -bottom-1 -left-1",
  "bottom-end": "absolute -bottom-1 end-0",
  "bottom-start": "absolute -bottom-1 start-0",
  center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  inline: "relative inline-flex items-center shrink-0 mx-1",
}

/**
 * Reusable NotificationDot Component
 * Displays a clean, static indicator matching the favorites heart badge (bg-rose-500),
 * with optional count, custom colors, sizes, and placements.
 */
export const NotificationDot =
  React.forwardRef<HTMLSpanElement, NotificationDotProps>(
    (
      {
        visible = true,
        pulse = false,
        count,
        speed = "fast",
        color = "rose",
        size = "md",
        placement = "top-right",
        ringClassName = "",
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

      const preset = presetColorMap[color] || presetColorMap.rose

      const colorClass = colorClassName
        ? colorClassName
        : isCustomBgClass
          ? color
          : isCustomCssColor
            ? ""
            : preset.bgClass

      const colorStyle: React.CSSProperties | undefined = isCustomCssColor
        ? { backgroundColor: color, color: "#ffffff" }
        : undefined

      const resolvedSize = sizeMap[size]
      const resolvedPlacement = placementMap[placement]
      const hasCount = count !== undefined && count !== null && count !== ""

      const dotContent = (
        <span
          className={cn(
            "relative inline-flex items-center justify-center rounded-full font-bold shadow-xs select-none",
            hasCount
              ? "h-4 min-w-4 px-1 text-[10px] leading-none"
              : resolvedSize,
            colorClass,
            ringClassName,
            pulse &&
              (speed === "normal"
                ? "animate-pulse"
                : speed === "slow"
                  ? "animate-pulse duration-3000"
                  : "animate-pulse-dot"),
          )}
          style={colorStyle}
        >
          {hasCount ? count : null}
        </span>
      )

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
          {dotContent}
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
