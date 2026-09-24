import * as React from "react"
import { cn } from "@/lib/utils"
import { IconSearch, IconX } from "@tabler/icons-react"
import { Lang, useT } from "@/i18n"

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  lang?: Lang
  dir?: "rtl" | "ltr"
  className?: string
  inputClassName?: string
  showClearButton?: boolean
}

/**
 * Unified SearchBar Component
 * Provides a standardized, accessible search bar across Home, Favorites, and other screens.
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder,
      lang = "ar",
      dir: dirProp,
      className,
      inputClassName,
      showClearButton = true,
      disabled,
      autoFocus,
      ...props
    },
    ref,
  ) => {
    const dir = dirProp || (lang === "ar" ? "rtl" : "ltr")
    const T = useT(lang)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const resolvedRef = ref as React.RefObject<HTMLInputElement> || inputRef

    const resolvedPlaceholder =
      placeholder !== undefined ? placeholder : T.search

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onChange("")
      if (onClear) onClear()
      if (resolvedRef.current) {
        resolvedRef.current.focus()
      }
    }

    return (
      <div
        dir={dir}
        className={cn(
          "flex items-center gap-2.5 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3.5 h-11 transition-all focus-within:ring-2 focus-within:ring-[var(--primary)]/20 focus-within:border-[var(--primary)] shadow-2xs",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <div className="flex items-center text-[var(--muted-foreground)] shrink-0">
          <IconSearch size={18} stroke={2} />
        </div>

        <input
          ref={resolvedRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={resolvedPlaceholder}
          dir={dir}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "flex-1 w-full bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none disabled:cursor-not-allowed",
            inputClassName,
          )}
          {...props}
        />

        {showClearButton && value && value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="w-5 h-5 rounded-full bg-[var(--muted)]/60 hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={lang === "ar" ? "مسح النص" : "Clear text"}
          >
            <IconX size={12} stroke={2.5} />
          </button>
        )}
      </div>
    )
  },
)

SearchBar.displayName = "SearchBar"

export default SearchBar
