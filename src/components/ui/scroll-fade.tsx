import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrollFadeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Scroll direction: vertical (top/bottom fade) or horizontal (left/right fade)
   * @default "vertical"
   */
  /**
   * The height/width of the fade gradient in pixels
   * @default 44
   */
  /**
   * Scroll threshold in pixels before triggering the fade
   * @default 4
   */
  /**
   * Fade gradient base color. Defaults to "var(--card)" (matching card / sheet background)
   * @default "var(--card)"
   */
  /**
   * Whether to show an optional subtle animated hint/cue when there is more content to scroll to
   * @default true
   */
  /**
   * Optional custom text for the scroll hint
   */
  /**
   * Optional language code for localized hint
   * @default "ar"
   */
  /**
   * Layout direction
   * @default "rtl"
   */
  /**
   * Explicit maximum height for vertical scrolling container (e.g. 200 or "200px")
   */
  /**
   * Explicit maximum width for horizontal scrolling container
   */
  /**
   * CSS class name for the internal content container
   */
  /**
   * Custom style for the internal scrollable container
   */
  /**
   * Use CSS mask-image in addition to gradient overlays
   * @default true
   */
  /**
   * Automatically perform a gentle introductory peek motion (scroll down then back up)
   * to immediately signal to the user that the list is scrollable.
   * @default true
   */
  /**
   * Distance in pixels for the introductory peek motion
   * @default 36
   */
  /**
   * Delay in milliseconds before executing the introductory peek motion
   * @default 380
   */
  orientation?: "vertical" | "horizontal"
  fadeSize?: number
  fadeOffset?: number
  fadeColor?: string
  showHint?: boolean
  hintText?: string
  lang?: "ar" | "en"
  dir?: "rtl" | "ltr"
  maxHeight?: number | string
  maxWidth?: number | string
  contentClassName?: string
  contentStyle?: React.CSSProperties
  useMask?: boolean
  enablePeek?: boolean
  peekDistance?: number
  peekDelay?: number
}

/**
 * ScrollFade Component
 * Provides an adaptive, highly visible smooth edge fade and an introductory peek motion
 * on scrollable lists that contain hidden/overflowing content.
 * Supports both vertical and horizontal scrolling.
 */
export const ScrollFade = React.forwardRef<HTMLDivElement, ScrollFadeProps>(
  (
    {
      orientation = "vertical",
      fadeSize = 44,
      fadeOffset = 4,
      fadeColor = "var(--card)",
      showHint = true,
      hintText,
      lang = "ar",
      dir = "rtl",
      maxHeight,
      maxWidth,
      className,
      contentClassName,
      contentStyle,
      useMask = true,
      enablePeek = true,
      peekDistance = 24,
      peekDelay = 320,
      children,
      onScroll: onScrollProp,
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const internalScrollRef = React.useRef<HTMLDivElement>(null)
    const scrollRef =
      forwardedRef as React.RefObject<HTMLDivElement> || internalScrollRef

    const [canScrollStart, setCanScrollStart] = React.useState(false)
    const [canScrollEnd, setCanScrollEnd] = React.useState(false)
    const [hasInteracted, setHasInteracted] = React.useState(false)

    const isPeekingRef = React.useRef(false)
    const hasInteractedRef = React.useRef(false)
    const hasPeekedRef = React.useRef(false)
    const peekAnimRef = React.useRef<number | null>(null)
    const peekTimerRef = React.useRef<NodeJS.Timeout | null>(null)

    const isRtl = dir === "rtl"

    const checkScroll = React.useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      if (orientation === "vertical") {
        const { scrollTop, scrollHeight, clientHeight } = el
        const maxScroll = scrollHeight - clientHeight

        if (maxScroll <= fadeOffset) {
          setCanScrollStart(false)
          setCanScrollEnd(false)
          return
        }

        setCanScrollStart(scrollTop > fadeOffset)
        setCanScrollEnd(scrollTop < maxScroll - fadeOffset)
      } else {
        const { scrollLeft, scrollWidth, clientWidth } = el
        const maxScroll = scrollWidth - clientWidth

        if (maxScroll <= fadeOffset) {
          setCanScrollStart(false)
          setCanScrollEnd(false)
          return
        }

        const absScroll = Math.abs(scrollLeft)
        if (isRtl) {
          setCanScrollStart(absScroll > fadeOffset)
          setCanScrollEnd(absScroll < maxScroll - fadeOffset)
        } else {
          setCanScrollStart(scrollLeft > fadeOffset)
          setCanScrollEnd(scrollLeft < maxScroll - fadeOffset)
        }
      }
    }, [orientation, fadeOffset, isRtl, scrollRef])

    // Interaction handler to cancel peek if user touches or wheels
    const handleUserInteraction = React.useCallback(() => {
      isPeekingRef.current = false
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true
        setHasInteracted(true)
      }
      if (peekAnimRef.current) {
        cancelAnimationFrame(peekAnimRef.current)
        peekAnimRef.current = null
      }
      if (peekTimerRef.current) {
        clearTimeout(peekTimerRef.current)
        peekTimerRef.current = null
      }
    }, [])

    // Introductory peek motion: smoothly scroll down, pause briefly, then scroll back up
    const performPeek = React.useCallback(() => {
      const el = scrollRef.current
      if (!el || hasInteractedRef.current || hasPeekedRef.current) return

      const isVert = orientation === "vertical"
      const maxScroll = isVert
        ? el.scrollHeight - el.clientHeight
        : el.scrollWidth - el.clientWidth

      // If layout hasn't settled yet, retry once after 120ms
      if (maxScroll <= fadeOffset + 4) {
        setTimeout(() => {
          const retryEl = scrollRef.current
          if (!retryEl || hasInteractedRef.current || hasPeekedRef.current)
            return
          const retryMax = isVert
            ? retryEl.scrollHeight - retryEl.clientHeight
            : retryEl.scrollWidth - retryEl.clientWidth
          if (retryMax > fadeOffset + 4) {
            performPeek()
          }
        }, 120)
        return
      }

      hasPeekedRef.current = true
      isPeekingRef.current = true

      // Subtle, quick micro-nudge (~24px)
      const actualDistance = Math.min(
        peekDistance,
        Math.max(14, maxScroll * 0.4),
      )
      const startTime = performance.now()

      // Crisp, fast timing: 260ms down, 60ms pause, 260ms up (~580ms total)
      const downDuration = 260
      const pauseDuration = 60
      const upDuration = 260
      const totalDuration = downDuration + pauseDuration + upDuration // 580ms

      const initialScroll = isVert ? el.scrollTop : el.scrollLeft

      const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

      const step = (now: number) => {
        if (hasInteractedRef.current || !scrollRef.current) {
          isPeekingRef.current = false
          if (peekAnimRef.current) cancelAnimationFrame(peekAnimRef.current)
          return
        }

        const elapsed = now - startTime

        let factor = 0
        if (elapsed < downDuration) {
          // Phase 1: Smoothly gliding down
          const p = elapsed / downDuration
          factor = easeInOutQuad(p)
        } else if (elapsed < downDuration + pauseDuration) {
          // Phase 2: Subtle pause at bottom peak so the user sees the hidden items
          factor = 1
        } else if (elapsed < totalDuration) {
          // Phase 3: Smoothly gliding back up
          const p = (elapsed - downDuration - pauseDuration) / upDuration
          factor = 1 - easeInOutQuad(p)
        } else {
          factor = 0
        }

        const currentOffset = factor * actualDistance

        if (isVert) {
          el.scrollTop = initialScroll + currentOffset
        } else {
          if (isRtl) {
            el.scrollLeft = initialScroll - currentOffset
          } else {
            el.scrollLeft = initialScroll + currentOffset
          }
        }

        checkScroll()

        if (elapsed < totalDuration) {
          peekAnimRef.current = requestAnimationFrame(step)
        } else {
          isPeekingRef.current = false
          if (isVert) el.scrollTop = initialScroll
          else el.scrollLeft = initialScroll
          checkScroll()
        }
      }

      peekAnimRef.current = requestAnimationFrame(step)
    }, [orientation, fadeOffset, peekDistance, isRtl, scrollRef, checkScroll])

    // Trigger peek once after container transition stabilizes
    React.useEffect(() => {
      if (!enablePeek || hasPeekedRef.current || hasInteractedRef.current)
        return

      peekTimerRef.current = setTimeout(() => {
        checkScroll()
        performPeek()
      }, peekDelay)

      return () => {
        if (peekTimerRef.current) {
          clearTimeout(peekTimerRef.current)
          peekTimerRef.current = null
        }
        if (peekAnimRef.current) {
          cancelAnimationFrame(peekAnimRef.current)
          peekAnimRef.current = null
        }
      }
    }, [enablePeek, peekDelay, performPeek])

    // Monitor resize and layout changes to update fade boundaries
    React.useEffect(() => {
      const el = scrollRef.current
      if (!el) return

      checkScroll()

      const observer = new ResizeObserver(() => {
        checkScroll()
      })

      observer.observe(el)
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild)
      }

      window.addEventListener("resize", checkScroll)

      const t1 = setTimeout(checkScroll, 60)
      const t2 = setTimeout(checkScroll, 200)
      const t3 = setTimeout(checkScroll, 450)

      return () => {
        observer.disconnect()
        window.removeEventListener("resize", checkScroll)
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }, [checkScroll, scrollRef])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      checkScroll()
      // If scroll was triggered by our programmatic peek animation, don't cancel it!
      if (isPeekingRef.current) {
        return
      }
      handleUserInteraction()
      if (onScrollProp) onScrollProp(e)
    }

    // Dynamic CSS mask-image for soft edge fade
    const maskImage = React.useMemo(() => {
      if (!useMask) return undefined

      if (orientation === "vertical") {
        if (canScrollStart && canScrollEnd) {
          return `linear-gradient(to bottom, transparent 0%, black ${fadeSize}px, black calc(100% - ${fadeSize}px), transparent 100%)`
        }
        if (canScrollStart) {
          return `linear-gradient(to bottom, transparent 0%, black ${fadeSize}px, black 100%)`
        }
        if (canScrollEnd) {
          return `linear-gradient(to bottom, black 0%, black calc(100% - ${fadeSize}px), transparent 100%)`
        }
        return undefined
      } else {
        if (canScrollStart && canScrollEnd) {
          return `linear-gradient(to right, transparent 0%, black ${fadeSize}px, black calc(100% - ${fadeSize}px), transparent 100%)`
        }
        if (canScrollStart) {
          return isRtl
            ? `linear-gradient(to right, black 0%, black calc(100% - ${fadeSize}px), transparent 100%)`
            : `linear-gradient(to right, transparent 0%, black ${fadeSize}px, black 100%)`
        }
        if (canScrollEnd) {
          return isRtl
            ? `linear-gradient(to right, transparent 0%, black ${fadeSize}px, black 100%)`
            : `linear-gradient(to right, black 0%, black calc(100% - ${fadeSize}px), transparent 100%)`
        }
        return undefined
      }
    }, [useMask, orientation, canScrollStart, canScrollEnd, fadeSize, isRtl])

    return (
      <div
        className={cn(
          "relative flex flex-col min-h-0 w-full overflow-hidden",
          orientation === "vertical" ? "w-full" : "h-full flex-row",
          className,
        )}
        style={{
          maxHeight,
          maxWidth,
          ...style,
        }}
        dir={dir}
        {...props}
      >
        {/* Top Fade Overlay (Vertical) */}
        {orientation === "vertical" && (
          <div
            className={cn(
              "pointer-events-none absolute top-0 inset-x-0 z-20 transition-opacity duration-300",
              canScrollStart ? "opacity-100" : "opacity-0",
            )}
            style={{
              height: `${fadeSize}px`,
              background: `linear-gradient(to bottom, ${fadeColor} 10%, color-mix(in srgb, ${fadeColor} 75%, transparent) 55%, transparent 100%)`,
            }}
          />
        )}

        {/* Start Fade Overlay (Horizontal: Right in RTL, Left in LTR) */}
        {orientation === "horizontal" && (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 z-20 transition-opacity duration-300",
              isRtl ? "right-0" : "left-0",
              canScrollStart ? "opacity-100" : "opacity-0",
            )}
            style={{
              width: `${fadeSize}px`,
              background: isRtl
                ? `linear-gradient(to left, ${fadeColor} 10%, color-mix(in srgb, ${fadeColor} 75%, transparent) 55%, transparent 100%)`
                : `linear-gradient(to right, ${fadeColor} 10%, color-mix(in srgb, ${fadeColor} 75%, transparent) 55%, transparent 100%)`,
            }}
          />
        )}

        {/* Native Touch & Wheel Scrollable Container (Pure Scrollport) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleUserInteraction}
          onWheel={handleUserInteraction}
          onPointerDown={handleUserInteraction}
          className={cn(
            "w-full flex-1 min-h-0",
            orientation === "vertical"
              ? "overflow-y-auto overflow-x-hidden"
              : "overflow-x-auto overflow-y-hidden",
          )}
          style={{
            maxHeight,
            maxWidth,
            WebkitMaskImage: maskImage,
            maskImage: maskImage,
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            ...contentStyle,
          }}
        >
          {/* Inner content wrapper preserving grid / flex layouts */}
          <div className={cn("w-full", contentClassName)}>{children}</div>
        </div>

        {/* Bottom Fade Overlay (Vertical) */}
        {orientation === "vertical" && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 inset-x-0 z-20 transition-opacity duration-300",
              canScrollEnd ? "opacity-100" : "opacity-0",
            )}
            style={{
              height: `${fadeSize}px`,
              background: `linear-gradient(to top, ${fadeColor} 10%, color-mix(in srgb, ${fadeColor} 75%, transparent) 55%, transparent 100%)`,
            }}
          />
        )}

        {/* End Fade Overlay (Horizontal: Left in RTL, Right in LTR) */}
        {orientation === "horizontal" && (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 z-20 transition-opacity duration-300",
              isRtl ? "left-0" : "right-0",
              canScrollEnd ? "opacity-100" : "opacity-0",
            )}
            style={{
              width: `${fadeSize}px`,
              background: isRtl
                ? `linear-gradient(to right, ${fadeColor} 10%, color-mix(in srgb, ${fadeColor} 75%, transparent) 55%, transparent 100%)`
                : `linear-gradient(to left, ${fadeColor} 10%, color-mix(in srgb, ${fadeColor} 75%, transparent) 55%, transparent 100%)`,
            }}
          />
        )}
      </div>
    )
  },
)

ScrollFade.displayName = "ScrollFade"

export default ScrollFade
