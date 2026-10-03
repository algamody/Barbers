import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react"

export type SnackbarType = "success" | "info" | "warning" | "error" | "default"

export const DEFAULT_SNACKBAR_DURATION = 3500

export interface SnackbarProps {
  /** Controls visibility */
  open?: boolean
  isOpen?: boolean
  /** Callback fired when snackbar is closed / dismissed */
  onClose?: () => void
  /** Auto-dismiss duration in milliseconds (default: 3500ms, set to 0 or null to disable) */
  duration?: number | null
  /** Primary title text */
  title: React.ReactNode
  /** Secondary description text */
  description?: React.ReactNode
  /** Visual variant type */
  type?: SnackbarType
  /** Custom icon override */
  icon?: React.ReactNode
  /** Custom action slot (e.g., button) */
  action?: React.ReactNode
  /** Whether to show a dismiss 'x' button */
  showCloseButton?: boolean
  /** Distance from the bottom (defaults to 5.5rem if bottom nav is present, 2rem otherwise) */
  bottomOffset?: string | number
  /** Distance from top if top-positioned */
  topOffset?: string | number
  /** Vertical position */
  position?: "bottom" | "top"
  /** Text direction */
  dir?: "rtl" | "ltr"
  /** Additional CSS classes for the toast card */
  className?: string
  /** Additional CSS styles for the toast card */
  style?: React.CSSProperties
  /** Children if custom rendering is needed */
  children?: React.ReactNode
  /** Optional theme override ("dark" | "light") */
  theme?: "dark" | "light"
  /** Optional callback when the snackbar card itself is clicked */
  onClick?: () => void
  /** Whether to enable swipe / pull down to dismiss (default: true) */
  dismissible?: boolean
  /** Disable portal if needed */
  disablePortal?: boolean
}

// ----------------------------------------------------------------------
// Global Snackbar Event Dispatcher & Host
// ----------------------------------------------------------------------

export interface GlobalSnackbarOptions {
  title?: React.ReactNode
  message?: React.ReactNode
  description?: React.ReactNode
  type?: SnackbarType
  duration?: number | null
  action?: React.ReactNode
  onClick?: () => void
  dir?: "rtl" | "ltr"
  theme?: "dark" | "light"
  showCloseButton?: boolean
}

type SnackbarListener = (opts: GlobalSnackbarOptions | null) => void
const globalListeners = new Set<SnackbarListener>()

export function showSnackbar(options: GlobalSnackbarOptions | string) {
  const payload: GlobalSnackbarOptions =
    typeof options === "string"
      ? { title: options, type: "success" }
      : {
          ...options,
          title: options.title ?? options.message ?? "",
        }
  globalListeners.forEach((fn) => fn(payload))
}

export function hideSnackbar() {
  globalListeners.forEach((fn) => fn(null))
}

export function GlobalSnackbarHost({
  dir = "rtl",
  theme,
}: {
  dir?: "rtl" | "ltr"
  theme?: "dark" | "light"
}) {
  const [current, setCurrent] = React.useState<GlobalSnackbarOptions | null>(
    null,
  )
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const listener: SnackbarListener = (opts) => {
      if (opts) {
        setCurrent(opts)
        setOpen(true)
      } else {
        setOpen(false)
      }
    }
    globalListeners.add(listener)
    return () => {
      globalListeners.delete(listener)
    }
  }, [])

  if (!current) return null

  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      title={current.title}
      description={current.description}
      type={current.type || "success"}
      duration={current.duration}
      action={current.action}
      showCloseButton={current.showCloseButton}
      onClick={current.onClick}
      dir={current.dir || dir}
      theme={current.theme || theme}
    />
  )
}

// ----------------------------------------------------------------------
// Snackbar Component
// ----------------------------------------------------------------------

export function Snackbar({
  open: openProp,
  isOpen,
  onClose,
  duration = DEFAULT_SNACKBAR_DURATION,
  title,
  description,
  type = "success",
  icon,
  action,
  showCloseButton = false,
  bottomOffset,
  topOffset = "1.5rem",
  position = "bottom",
  dir = "rtl",
  className,
  style,
  theme: themeProp,
  onClick,
  children,
  dismissible = true,
  disablePortal = false,
}: SnackbarProps) {
  const open = openProp ?? isOpen ?? false
  const [rendered, setRendered] = React.useState(open)
  const [isClosing, setIsClosing] = React.useState(false)

  // Portal container reference
  const [portalNode, setPortalNode] = React.useState<HTMLElement | null>(null)

  // Auto-detect bottom navigation in the phone frame
  const [hasBottomNav, setHasBottomNav] = React.useState(false)

  // Auto-detect active app theme if theme prop is not explicitly passed
  const [detectedTheme, setDetectedTheme] = React.useState<"dark" | "light">(
    "light",
  )

  React.useEffect(() => {
    if (themeProp) return

    const resolveAppTheme = (): "dark" | "light" => {
      const frame =
        document.getElementById("phone-frame") ||
        document.querySelector<HTMLElement>("[data-phone-frame]")
      if (frame) {
        if (
          frame.classList.contains("dark") ||
          frame.getAttribute("data-theme") === "dark"
        ) {
          return "dark"
        }
        return "light"
      }
      if (
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark"
      ) {
        return "dark"
      }
      try {
        const saved = localStorage.getItem("app_theme")
        if (saved === "dark" || saved === "light") return saved
      } catch {}
      return "light"
    }

    setDetectedTheme(resolveAppTheme())

    const observer = new MutationObserver(() => {
      setDetectedTheme(resolveAppTheme())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })

    const frame = document.getElementById("phone-frame")
    if (frame) {
      observer.observe(frame, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      })
    }

    return () => observer.disconnect()
  }, [themeProp])

  const effectiveTheme = themeProp || detectedTheme
  const isDark = effectiveTheme === "dark"

  React.useEffect(() => {
    if (disablePortal) return

    const updatePortalAndNav = () => {
      const frame =
        document.getElementById("phone-frame") ||
        document.querySelector<HTMLElement>("[data-phone-frame]")
      if (frame) {
        setPortalNode(frame)
      } else if (typeof document !== "undefined") {
        setPortalNode(document.body)
      }

      const navEl = document.querySelector('[data-bottom-nav="true"]')
      setHasBottomNav(!!navEl)
    }

    updatePortalAndNav()

    const observer = new MutationObserver(updatePortalAndNav)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [disablePortal])

  // Manage enter and exit animations
  const [hasEntered, setHasEntered] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const dismissTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const isDraggingRef = React.useRef(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const startYRef = React.useRef(0)
  const currentYRef = React.useRef(0)
  const startTimeRef = React.useRef(0)

  const handleClose = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)

      if (cardRef.current) {
        cardRef.current.style.transition =
          "transform 0.24s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease-out"
        const exitY = position === "top" ? -60 : 60
        cardRef.current.style.transform = `translateY(${exitY}px) scale(0.95)`
        cardRef.current.style.opacity = "0"
      }

      setIsClosing(true)
      setTimeout(() => {
        setRendered(false)
        setIsClosing(false)
        setHasEntered(false)
        onClose?.()
      }, 240)
    },
    [onClose, position],
  )

  // Auto-dismiss timer management
  const startAutoDismiss = React.useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    if (!open || !duration || duration <= 0) return

    dismissTimerRef.current = setTimeout(() => {
      handleClose()
    }, duration)
  }, [open, duration, handleClose])

  React.useEffect(() => {
    if (open) {
      setRendered(true)
      setIsClosing(false)
      setHasEntered(false)
      startAutoDismiss()
    } else if (rendered) {
      handleClose()
    }
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [open, rendered, startAutoDismiss, handleClose])

  // ----------------------------------------------------------------------
  // Real-Time iOS-Style Gesture Tracking (استجابة لحظية للسحب)
  // ----------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissible || isClosing) return
    if (e.button !== 0) return // Left click or primary touch only

    // Stop auto-dismiss while user is actively interacting
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)

    isDraggingRef.current = true
    setIsDragging(true)
    setHasEntered(true) // Immediately detach any CSS animation so transform is 100% interactive

    startYRef.current = e.clientY
    currentYRef.current = e.clientY
    startTimeRef.current = Date.now()

    if (cardRef.current) {
      cardRef.current.style.transition = "none"
      cardRef.current.style.willChange = "transform, opacity"
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !cardRef.current) return
    currentYRef.current = e.clientY
    const deltaY = e.clientY - startYRef.current

    let translateY = 0
    let opacity = 1
    let scale = 1

    if (position === "top") {
      if (deltaY < 0) {
        // Dragging upwards to dismiss: 1:1 real-time tracking
        translateY = deltaY
        opacity = Math.max(0.15, 1 - Math.abs(deltaY) / 200)
        scale = Math.max(0.92, 1 - Math.abs(deltaY) / 1000)
      } else {
        // Dragging downwards: rubber-band resistance
        translateY = Math.pow(deltaY, 0.78) * 1.4
      }
    } else {
      // Bottom positioned (standard for this app)
      if (deltaY > 0) {
        // Dragging downwards to dismiss: 1:1 real-time tracking
        translateY = deltaY
        opacity = Math.max(0.15, 1 - deltaY / 220)
        scale = Math.max(0.92, 1 - deltaY / 1200)
      } else {
        // Dragging upwards: rubber-band resistance
        translateY = -Math.pow(Math.abs(deltaY), 0.78) * 1.4
      }
    }

    // Direct instantaneous 60fps/120fps DOM update with zero latency
    cardRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`
    cardRef.current.style.opacity = `${opacity}`
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !cardRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    const deltaY = currentYRef.current - startYRef.current
    const deltaTime = Math.max(Date.now() - startTimeRef.current, 1)
    const velocity = deltaY / deltaTime

    const isBottom = position === "bottom"
    const dismissDirection = isBottom ? deltaY > 0 : deltaY < 0
    const absDelta = Math.abs(deltaY)
    const absVelocity = Math.abs(velocity)

    // Check if dismissed past threshold (50px) or flicked with momentum
    if (
      dismissDirection &&
      (absDelta > 48 || (absDelta > 14 && absVelocity > 0.35))
    ) {
      // Smoothly continue downwards off-screen from current dragged position
      const finalY = isBottom
        ? Math.max(deltaY + 160, 220)
        : Math.min(deltaY - 160, -220)

      cardRef.current.style.transition =
        "transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.18s ease-out"
      cardRef.current.style.transform = `translateY(${finalY}px) scale(0.9)`
      cardRef.current.style.opacity = "0"

      setIsClosing(true)
      setTimeout(() => {
        setRendered(false)
        setIsClosing(false)
        setHasEntered(false)
        onClose?.()
      }, 220)
    } else {
      // Fluid spring snap back (iOS-like bounce)
      cardRef.current.style.transition =
        "transform 0.34s cubic-bezier(0.175, 0.885, 0.32, 1.25), opacity 0.24s ease-out"
      cardRef.current.style.transform = "translateY(0px) scale(1)"
      cardRef.current.style.opacity = "1"

      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.willChange = "auto"
        }
      }, 340)

      // Clean tap detection (< 5px drag)
      if (absDelta < 5 && onClick) {
        onClick()
      }

      // Resume auto-dismiss timer
      startAutoDismiss()
    }
  }

  if (!rendered) return null

  // Fully opaque solid styles and harmonious text colors per variant strictly following app theme
  const typeStyles: Record<SnackbarType, {
    container: string
    title: string
    desc: string
    icon: string
  }> = {
    success: {
      container: isDark
        ? "bg-[#1a2e20] border-emerald-500/45 shadow-xl shadow-black/60"
        : "bg-[#e6f0e8] border-emerald-600/35 shadow-xl shadow-black/15",
      title: isDark ? "text-emerald-100" : "text-emerald-900",
      desc: isDark ? "text-emerald-300" : "text-emerald-700",
      icon: isDark ? "text-emerald-400" : "text-emerald-700",
    },
    warning: {
      container: isDark
        ? "bg-[#281d12] border-amber-500/40 shadow-xl shadow-black/60"
        : "bg-[#fef7ee] border-amber-500/40 shadow-xl shadow-black/15",
      title: isDark ? "text-amber-100" : "text-amber-950",
      desc: isDark ? "text-amber-300" : "text-amber-800",
      icon: isDark ? "text-amber-400" : "text-amber-600",
    },
    error: {
      container: isDark
        ? "bg-[#2b1215] border-rose-500/40 shadow-xl shadow-black/60"
        : "bg-[#feeeee] border-rose-500/40 shadow-xl shadow-black/15",
      title: isDark ? "text-rose-100" : "text-rose-950",
      desc: isDark ? "text-rose-300" : "text-rose-800",
      icon: isDark ? "text-rose-400" : "text-rose-600",
    },
    info: {
      container: isDark
        ? "bg-[#121f2d] border-sky-500/40 shadow-xl shadow-black/60"
        : "bg-[#eef6fe] border-sky-500/40 shadow-xl shadow-black/15",
      title: isDark ? "text-sky-100" : "text-sky-950",
      desc: isDark ? "text-sky-300" : "text-sky-800",
      icon: isDark ? "text-sky-400" : "text-sky-600",
    },
    default: {
      container: isDark
        ? "bg-[#1c1612] border-[#2e2218] shadow-xl shadow-black/60 text-[#f5f0ea]"
        : "bg-white border-[#e0e0e0] shadow-xl shadow-black/15 text-[#111111]",
      title: isDark ? "text-[#f5f0ea]" : "text-[#111111]",
      desc: isDark ? "text-[#c8bfb4]" : "text-[#6e6158]",
      icon: "text-[#e8722a]",
    },
  }

  const currentStyle = typeStyles[type] || typeStyles.default

  const renderIcon = () => {
    if (icon) return icon

    switch (type) {
      case "success":
        return (
          <IconCircleCheck
            size={24}
            stroke={2}
            className={cn("shrink-0", currentStyle.icon)}
          />
        )
      case "warning":
        return (
          <IconAlertTriangle
            size={24}
            stroke={2}
            className={cn("shrink-0", currentStyle.icon)}
          />
        )
      case "error":
        return (
          <IconAlertCircle
            size={24}
            stroke={2}
            className={cn("shrink-0", currentStyle.icon)}
          />
        )
      case "info":
      case "default":
      default:
        return (
          <IconInfoCircle
            size={24}
            stroke={2}
            className={cn("shrink-0", currentStyle.icon)}
          />
        )
    }
  }

  // Unified exact position: 5.5rem when bottom nav is present, 2rem when bottom nav is absent
  const resolvedBottom =
    bottomOffset !== undefined ? bottomOffset : hasBottomNav ? "5.5rem" : "2rem"

  const positionStyles: React.CSSProperties =
    position === "bottom" ? { bottom: resolvedBottom } : { top: topOffset }

  const content = (
    <div
      className="absolute left-4 right-4 z-[9999] pointer-events-none flex justify-center"
      style={positionStyles}
      dir={dir}
    >
      <div
        ref={cardRef}
        role="status"
        aria-live="polite"
        data-theme={isDark ? "dark" : "light"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onAnimationEnd={() => setHasEntered(true)}
        className={cn(
          "pointer-events-auto w-full max-w-[360px] rounded-2xl px-4 py-3.5 flex flex-col gap-1.5 border select-none shadow-2xl",
          isDark ? "dark" : "",
          currentStyle.container,
          onClick && !isDragging && "cursor-pointer",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          !hasEntered && !isDragging && !isClosing && "animate-snackbar-enter",
          className,
        )}
        style={{
          ...style,
          touchAction: "none",
        }}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Status Icon */}
          <div className="shrink-0 flex items-center justify-center">
            {renderIcon()}
          </div>

          {/* Content Text */}
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-sm font-semibold leading-tight",
                currentStyle.title,
              )}
            >
              {title}
            </div>
            {description && (
              <div
                className={cn("text-xs mt-1 leading-snug", currentStyle.desc)}
              >
                {description}
              </div>
            )}
          </div>

          {/* Optional Action Slot */}
          {action && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              {action}
            </div>
          )}

          {/* Optional Close Button */}
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "shrink-0 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity cursor-pointer",
                isDark
                  ? "hover:bg-white/10 text-white"
                  : "hover:bg-black/5 text-black",
              )}
              aria-label="Close"
            >
              <IconX size={16} stroke={2} />
            </button>
          )}
        </div>

        {/* Subtle swipe-down drag indicator */}
        <div className="w-8 h-1 rounded-full bg-current opacity-20 mx-auto -mb-1 mt-0.5 pointer-events-none" />
      </div>
    </div>
  )

  if (!disablePortal && portalNode) {
    return createPortal(content, portalNode)
  }

  return content
}
