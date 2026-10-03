import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconDoorExit,
  IconX,
} from "@tabler/icons-react"

export type AlertDialogType = "info" | "warning" | "error" | "success" | "closed"

export interface AlertDialogProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  type?: AlertDialogType
  icon?: React.ReactNode
  confirmText?: string
  onConfirm?: () => void
  cancelText?: string
  onCancel?: () => void
  showCloseButton?: boolean
  preventBackdropClose?: boolean
  className?: string
  dir?: "rtl" | "ltr"
  children?: React.ReactNode
}

export function AlertDialog({
  open: openProp,
  isOpen,
  onClose,
  title,
  description,
  type = "info",
  icon,
  confirmText = "حسناً",
  onConfirm,
  cancelText,
  onCancel,
  showCloseButton = false,
  preventBackdropClose = false,
  className,
  dir = "rtl",
  children,
}: AlertDialogProps) {
  const open = openProp ?? isOpen ?? false
  const [rendered, setRendered] = React.useState(open)
  const [isClosing, setIsClosing] = React.useState(false)

  // Portal node detection to ensure backdrop covers the full phone screen (including main tabs)
  const [portalNode, setPortalNode] = React.useState<HTMLElement | null>(() => {
    if (typeof document !== "undefined") {
      return (
        document.getElementById("phone-frame") ||
        document.querySelector<HTMLElement>("[data-phone-frame]") ||
        document.body
      )
    }
    return null
  })

  React.useEffect(() => {
    const updateTarget = () => {
      const frame =
        document.getElementById("phone-frame") ||
        document.querySelector<HTMLElement>("[data-phone-frame]") ||
        (typeof document !== "undefined" ? document.body : null)
      if (frame && frame !== portalNode) {
        setPortalNode(frame)
      }
    }
    updateTarget()
    const observer = new MutationObserver(updateTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [portalNode])

  React.useEffect(() => {
    if (open) {
      setRendered(true)
      setIsClosing(false)
    } else if (rendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setRendered(false)
        setIsClosing(false)
      }, 130)
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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  const renderIcon = () => {
    if (icon) return icon

    switch (type) {
      case "closed":
        return (
          <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/25 text-red-500 flex items-center justify-center shadow-xs">
            <IconDoorExit size={30} stroke={2.2} />
          </div>
        )
      case "error":
        return (
          <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/25 text-red-500 flex items-center justify-center shadow-xs">
            <IconAlertCircle size={30} stroke={2.2} />
          </div>
        )
      case "warning":
        return (
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/25 text-amber-500 flex items-center justify-center shadow-xs">
            <IconAlertTriangle size={30} stroke={2.2} />
          </div>
        )
      case "success":
        return (
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 flex items-center justify-center shadow-xs">
            <IconCheck size={30} stroke={2.5} />
          </div>
        )
      case "info":
      default:
        return (
          <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/15 border border-[var(--primary)]/25 text-[var(--primary)] flex items-center justify-center shadow-xs">
            <IconInfoCircle size={30} stroke={2.2} />
          </div>
        )
    }
  }

  const isInsideFrame =
    !!portalNode &&
    (portalNode.id === "phone-frame" ||
      portalNode.hasAttribute("data-phone-frame"))
  const posClass = isInsideFrame ? "absolute" : "fixed"

  const content = (
    <div
      className={cn(
        posClass,
        "inset-0 z-[100] flex items-center justify-center p-4",
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          posClass,
          "inset-0 bg-black/70 backdrop-blur-xs",
          isClosing ? "animate-backdrop-exit" : "animate-backdrop-enter",
        )}
        onClick={() => !preventBackdropClose && !isClosing && onClose()}
      />

      {/* Modal Dialog Card */}
      <div
        dir={dir}
        className={cn(
          "relative z-10 w-full max-w-sm rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl flex flex-col items-center text-center",
          isClosing ? "animate-modal-exit" : "animate-modal-enter",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional top close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 start-4 w-8 h-8 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX size={16} stroke={2} />
          </button>
        )}

        {/* Top Icon Badge */}
        <div className="mb-4">{renderIcon()}</div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight px-1">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed px-2">
            {description}
          </p>
        )}

        {/* Custom Body Slot */}
        {children && <div className="w-full mt-3">{children}</div>}

        {/* Actions */}
        <div className="w-full mt-6 flex gap-2.5">
          {cancelText && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="flex-1 rounded-2xl h-12 font-bold border-[var(--border)] cursor-pointer"
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant="default"
            size="lg"
            fullWidth={!cancelText}
            onClick={handleConfirm}
            className={cn(
              "rounded-2xl h-12 font-bold shadow-md cursor-pointer",
              cancelText ? "flex-1" : "w-full",
              (type === "closed" || type === "error") &&
                "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20",
              type === "success" &&
                "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )

  if (portalNode) {
    return createPortal(content, portalNode)
  }

  return content
}

export default AlertDialog
