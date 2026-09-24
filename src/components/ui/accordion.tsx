import * as React from "react"
import { cn } from "@/lib/utils"
import { IconChevronDown } from "@tabler/icons-react"

type AccordionType = "single" | "multiple"

interface AccordionContextValue {
  type: AccordionType
  value: string[]
  toggleItem: (itemValue: string) => void
  isItemOpen: (itemValue: string) => boolean
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionType
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string[] | string) => void
  collapsible?: boolean
  children: React.ReactNode
}

export function Accordion({
  type = "multiple",
  value: controlledValue,
  defaultValue,
  onValueChange,
  collapsible = true,
  className,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
    () => {
      if (defaultValue !== undefined) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
      }
      return []
    },
  )

  const isControlled = controlledValue !== undefined
  const currentValues = React.useMemo(() => {
    if (isControlled) {
      return Array.isArray(controlledValue)
        ? controlledValue
        : controlledValue
          ? [controlledValue]
          : []
    }
    return uncontrolledValue
  }, [isControlled, controlledValue, uncontrolledValue])

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      let nextValues: string[]
      if (type === "single") {
        const isCurrentlyOpen = currentValues.includes(itemValue)
        if (isCurrentlyOpen) {
          nextValues = collapsible ? [] : [itemValue]
        } else {
          nextValues = [itemValue]
        }
      } else {
        if (currentValues.includes(itemValue)) {
          nextValues = currentValues.filter((v) => v !== itemValue)
        } else {
          nextValues = [...currentValues, itemValue]
        }
      }

      if (!isControlled) {
        setUncontrolledValue(nextValues)
      }

      if (onValueChange) {
        if (type === "single") {
          onValueChange(nextValues[0] || "")
        } else {
          onValueChange(nextValues)
        }
      }
    },
    [type, currentValues, collapsible, isControlled, onValueChange],
  )

  const isItemOpen = React.useCallback(
    (itemValue: string) => currentValues.includes(itemValue),
    [currentValues],
  )

  return (
    <AccordionContext.Provider
      value={{
        type,
        value: currentValues,
        toggleItem,
        isItemOpen,
      }}
    >
      <div className={cn("space-y-2.5", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItemContext = React.createContext<{
  value: string
  isOpen: boolean
} | null>(null)

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const AccordionItem =
  React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, value, children, ...props }, ref) => {
      const accordion = React.useContext(AccordionContext)
      if (!accordion) {
        throw new Error("AccordionItem must be used within an Accordion")
      }

      const isOpen = accordion.isItemOpen(value)

      return (
        <AccordionItemContext.Provider value={{ value, isOpen }}>
          <div
            ref={ref}
            data-state={isOpen ? "open" : "closed"}
            className={cn(
              "rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-200 overflow-hidden shadow-2xs",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </AccordionItemContext.Provider>
      )
    },
  )
AccordionItem.displayName = "AccordionItem"

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hideChevron?: boolean
  chevronClassName?: string
}

export const AccordionTrigger =
  React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
    (
      {
        className,
        children,
        hideChevron = false,
        chevronClassName,
        onClick,
        ...props
      },
      ref,
    ) => {
      const accordion = React.useContext(AccordionContext)
      const item = React.useContext(AccordionItemContext)

      if (!accordion || !item) {
        throw new Error("AccordionTrigger must be used within an AccordionItem")
      }

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        accordion.toggleItem(item.value)
        onClick?.(e)
      }

      return (
        <button
          ref={ref}
          type="button"
          aria-expanded={item.isOpen}
          data-state={item.isOpen ? "open" : "closed"}
          onClick={handleClick}
          className={cn(
            "w-full flex items-center justify-between p-4 text-start font-medium transition-all hover:bg-[var(--secondary)]/40 cursor-pointer select-none",
            className,
          )}
          {...props}
        >
          <div className="flex-1 min-w-0">{children}</div>
          {!hideChevron && (
            <IconChevronDown
              size={18}
              stroke={2.2}
              className={cn(
                "shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ms-3",
                item.isOpen && "rotate-180 text-[var(--foreground)]",
                chevronClassName,
              )}
            />
          )}
        </button>
      )
    },
  )
AccordionTrigger.displayName = "AccordionTrigger"

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionContent =
  React.forwardRef<HTMLDivElement, AccordionContentProps>(
    ({ className, children, ...props }, ref) => {
      const item = React.useContext(AccordionItemContext)

      if (!item) {
        throw new Error("AccordionContent must be used within an AccordionItem")
      }

      return (
        <div
          ref={ref}
          data-state={item.isOpen ? "open" : "closed"}
          className={cn(
            "grid transition-[grid-template-rows] duration-250 ease-out",
            item.isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
          {...props}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "p-4 pt-0 border-t border-[var(--border)]/60",
                className,
              )}
            >
              {children}
            </div>
          </div>
        </div>
      )
    },
  )
AccordionContent.displayName = "AccordionContent"

// Collapsible (Standalone single collapsible trigger & content)
interface CollapsibleContextValue {
  open: boolean
  toggle: () => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null,
)

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const toggle = React.useCallback(() => {
    const nextOpen = !isOpen
    if (!isControlled) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }, [isOpen, isControlled, onOpenChange])

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, toggle }}>
      <div
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all overflow-hidden shadow-2xs",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

export interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hideChevron?: boolean
  chevronClassName?: string
}

export const CollapsibleTrigger =
  React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
    (
      {
        className,
        children,
        hideChevron = false,
        chevronClassName,
        onClick,
        ...props
      },
      ref,
    ) => {
      const context = React.useContext(CollapsibleContext)
      if (!context) {
        throw new Error("CollapsibleTrigger must be used within Collapsible")
      }

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        context.toggle()
        onClick?.(e)
      }

      return (
        <button
          ref={ref}
          type="button"
          aria-expanded={context.open}
          data-state={context.open ? "open" : "closed"}
          onClick={handleClick}
          className={cn(
            "w-full flex items-center justify-between p-4 text-start font-medium transition-all hover:bg-[var(--secondary)]/40 cursor-pointer select-none",
            className,
          )}
          {...props}
        >
          <div className="flex-1 min-w-0">{children}</div>
          {!hideChevron && (
            <IconChevronDown
              size={18}
              stroke={2.2}
              className={cn(
                "shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ms-3",
                context.open && "rotate-180 text-[var(--foreground)]",
                chevronClassName,
              )}
            />
          )}
        </button>
      )
    },
  )
CollapsibleTrigger.displayName = "CollapsibleTrigger"

export interface CollapsibleContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CollapsibleContent =
  React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
    ({ className, children, ...props }, ref) => {
      const context = React.useContext(CollapsibleContext)
      if (!context) {
        throw new Error("CollapsibleContent must be used within Collapsible")
      }

      return (
        <div
          ref={ref}
          data-state={context.open ? "open" : "closed"}
          className={cn(
            "grid transition-[grid-template-rows] duration-250 ease-out",
            context.open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
          {...props}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "p-4 pt-0 border-t border-[var(--border)]/60",
                className,
              )}
            >
              {children}
            </div>
          </div>
        </div>
      )
    },
  )
CollapsibleContent.displayName = "CollapsibleContent"
