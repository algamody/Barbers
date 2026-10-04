import { useState, useEffect, useCallback, useRef } from "react"

export interface UseOptions {
  enabled?: boolean
}

export interface UseResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Core async data-fetching hook adhering to Thunder UI architecture.
 * Consumes a Promise, a factory function returning a Promise, or null/undefined.
 * Prevents unmounted state updates, discards stale race conditions,
 * and exposes reactive loading, error, data, and refetch.
 */
export function use<T>(
  request: Promise<T> | (() => Promise<T>) | null | undefined,
  deps: unknown[] = [],
  options: UseOptions = {}
): UseResult<T> {
  const { enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(request && enabled))
  const [error, setError] = useState<Error | null>(null)

  const isMountedRef = useRef<boolean>(true)
  const executionCountRef = useRef<number>(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(async () => {
    if (!request || !enabled) {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      return
    }

    const currentExecution = ++executionCountRef.current
    if (isMountedRef.current) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const promise = typeof request === "function" ? request() : request
      const result = await promise

      // Only apply state if this is still the active execution and component is mounted
      if (isMountedRef.current && currentExecution === executionCountRef.current) {
        setData(result)
        setIsLoading(false)
      }
    } catch (err) {
      if (isMountedRef.current && currentExecution === executionCountRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }
  }, [request, enabled, ...deps])

  useEffect(() => {
    execute()
  }, [execute])

  const refetch = useCallback(async () => {
    await execute()
  }, [execute])

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
