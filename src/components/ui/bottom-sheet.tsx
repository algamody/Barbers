import * as React from "react"
import { cn } from "@/lib/utils"

export interface BottomSheetProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  showHandle?: boolean
  className?: string
  dir?: "rtl" | "ltr"
}

export function BottomSheet({
  open: openProp,
  isOpen,
  onClose,
  title,
  description,
  children,
  showHandle = true,
  className,
  dir = "rtl",
}: BottomSheetProps) {
  const open = openProp ?? isOpen ?? false
  const [rendered, setRendered] = React.useState(open)
  const [isClosing, setIsClosing] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setRendered(true)
      setIsClosing(false)
    } else if (rendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setRendered(false)
        setIsClosing(false)
      }, 260)
      return () => clearTimeout(timer)
    }
  }, [open, rendered])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!rendered) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-xs",
          isClosing ? "animate-backdrop-exit" : "animate-backdrop-enter",
        )}
        onClick={() => !isClosing && onClose()}
      />

      {/* Sheet panel */}
      <div
        dir={dir}
        className={cn(
          "relative z-10 w-full max-w-md mx-auto rounded-t-[32px] border-t border-[var(--border)] bg-[var(--card)] p-5 pb-8 shadow-2xl flex flex-col max-h-[85vh]",
          isClosing ? "animate-sheet-exit" : "animate-sheet-enter",
          className,
        )}
      >
        {/* Drag pill handle */}
        {showHandle && (
          <div className="w-12 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mx-auto mb-3 flex-shrink-0" />
        )}

        {/* Title */}
        {title && (
          <div className="pb-3 mb-2 border-b border-[var(--border)] text-center flex-shrink-0">
            {typeof title === "string" ? (
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {title}
              </h3>
            ) : (
              title
            )}
            {description && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default BottomSheet
