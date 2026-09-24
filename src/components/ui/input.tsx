import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, disabled, dir, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div
          dir={dir}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-3.5 transition-colors focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:border-transparent",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          {startIcon && (
            <div className="flex items-center text-[var(--muted-foreground)] flex-shrink-0">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            dir={dir}
            className="flex-1 w-full bg-transparent py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none disabled:cursor-not-allowed"
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {endIcon && (
            <div className="flex items-center text-[var(--muted-foreground)] flex-shrink-0">
              {endIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] shadow-xs transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
export default Input
