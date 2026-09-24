import * as React from "react"
import { Card } from "./card"
import { Badge } from "./badge"
import { Rating } from "./rating"
import { IconHeart, IconCheck, IconUsers } from "@tabler/icons-react"
import { Shop, isCommunityStatusActive, formatTimeHM } from "@/data"
import { Lang, useT } from "@/i18n"
import { cn } from "@/lib/utils"

export interface ShopCardProps {
  shop: Shop
  isFavorite?: boolean
  onToggleFavorite?: (shopId: string, e: React.MouseEvent) => void
  onClick?: () => void
  lang?: Lang
  dir?: "rtl" | "ltr"
  className?: string
  action?: React.ReactNode
}

/**
 * Unified ShopCard Component
 * Standardized barber salon card used across Home, Favorites, Map, and other screens.
 * Exactly matches the canonical design with photo, badges, favorite heart toggle, and rating.
 */
export function ShopCard({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  lang = "ar",
  dir: dirProp,
  className,
  action,
}: ShopCardProps) {
  const dir = dirProp || (lang === "ar" ? "rtl" : "ltr")
  const T = useT(lang)

  return (
    <Card
      interactive
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-2xl border-[var(--border)] bg-[var(--card)] p-0 transition-all hover:shadow-md",
        className,
      )}
      style={{ textAlign: dir === "rtl" ? "right" : "left" }}
    >
      {/* Photo with Overlays & Badges */}
      <div className="relative h-36 w-full overflow-hidden bg-[var(--card-alt)]">
        <img
          src={shop.photo}
          alt={lang === "ar" ? shop.nameAr : shop.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
          }}
        />

        {/* Top-Right Badges (Community Update) */}
        {isCommunityStatusActive(shop) && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="subtle"
              size="sm"
              className="bg-black/65 backdrop-blur-md text-[10px] text-zinc-200 border-amber-500/30 gap-1 font-medium"
            >
              <IconUsers
                size={13}
                stroke={2}
                className="text-[var(--primary)]"
              />
              {T.communityUpdateWithTime(
                formatTimeHM(shop.communityUpdate?.updatedAt, lang),
              )}
            </Badge>
          </div>
        )}

        {/* Closed Overlay */}
        {!shop.isOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px] flex items-center justify-center z-10 pointer-events-none">
            <span className="text-white text-base font-bold tracking-wide select-none drop-shadow-md">
              {T.closed}
            </span>
          </div>
        )}

        {/* Favorite Heart Toggle Button - Top Left */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onToggleFavorite(shop.id, e)
            }}
            className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/65 backdrop-blur-md flex items-center justify-center transition-transform active:scale-85 hover:scale-110 cursor-pointer shadow-md"
            title={
              isFavorite
                ? lang === "ar"
                  ? "إزالة من المفضلة"
                  : "Remove from favorites"
                : lang === "ar"
                  ? "إضافة للمفضلة"
                  : "Add to favorites"
            }
          >
            <IconHeart
              size={16}
              stroke={2}
              className={
                isFavorite ? "text-rose-500 fill-rose-500" : "text-white"
              }
            />
          </button>
        )}
      </div>

      {/* Card Body Info */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-semibold text-sm text-[var(--foreground)] truncate flex items-center gap-1">
              {lang === "ar" ? shop.nameAr : shop.name}
              {shop.isVerified && (
                <IconCheck
                  size={14}
                  stroke={3}
                  className="text-[var(--primary)] shrink-0"
                />
              )}
            </p>
            {action}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Rating value={shop.rating} size={13} />
            <span className="text-xs text-[var(--muted-foreground)]">
              ({shop.reviewCount})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 text-xs text-[var(--muted-foreground)]">
          <p className="truncate">{shop.address}</p>
          <span className="shrink-0">{shop.distance}</span>
        </div>
      </div>
    </Card>
  )
}

export default ShopCard
