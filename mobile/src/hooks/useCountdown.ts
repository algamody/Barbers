import { useState, useEffect, useRef } from "react"

export interface CountdownResult {
  totalSeconds: number
  minutes: number
  seconds: number
  isExpired: boolean
  formatted: string // "MM:SS"
}

interface UseCountdownOptions {
  onExpire?: () => void
}

/**
 * High-precision countdown hook anchored to a fixed server deadline (Date | string | number).
 * Prevents timer drift during app background/foreground switches.
 */
export function useCountdown(
  deadline: Date | string | number | null | undefined,
  options?: UseCountdownOptions
): CountdownResult {
  const getRemainingSeconds = (): number => {
    if (!deadline) return 0
    const targetMs = typeof deadline === "number" ? deadline : new Date(deadline).getTime()
    if (isNaN(targetMs)) return 0
    const diff = Math.max(0, Math.floor((targetMs - Date.now()) / 1000))
    return diff
  }

  const [totalSeconds, setTotalSeconds] = useState<number>(getRemainingSeconds)
  const onExpireRef = useRef(options?.onExpire)
  onExpireRef.current = options?.onExpire
  const hasTriggeredExpire = useRef(false)

  useEffect(() => {
    // Reset expiration flag whenever deadline changes
    hasTriggeredExpire.current = false
    setTotalSeconds(getRemainingSeconds())

    if (!deadline) return

    const interval = setInterval(() => {
      const remaining = getRemainingSeconds()
      setTotalSeconds(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        if (!hasTriggeredExpire.current) {
          hasTriggeredExpire.current = true
          onExpireRef.current?.()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return {
    totalSeconds,
    minutes,
    seconds,
    isExpired: totalSeconds <= 0,
    formatted,
  }
}
