import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        destructive:
          "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-xs",
        outline: "border border-[var(--border)] text-[var(--foreground)]",
        success:
          "border border-emerald-600/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        tonal:
          "border border-[var(--primary)]/30 bg-[var(--primary)]/15 text-[var(--primary)]",
        subtle:
          "border border-[var(--border)] bg-[var(--card-alt)] text-[var(--muted-foreground)]",
      },
      size: {
        default: "px-3 py-1 text-xs",
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export default Badge
