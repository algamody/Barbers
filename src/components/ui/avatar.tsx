import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  default: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-18 w-18 text-xl",
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)]",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
)
Avatar.displayName = "Avatar"

const AvatarImage =
  React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
    ({ className, ...props }, ref) => (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    ),
  )
AvatarImage.displayName = "AvatarImage"

const AvatarFallback =
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] font-medium",
          className,
        )}
        {...props}
      />
    ),
  )
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
export default Avatar
