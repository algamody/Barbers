import { useState } from "react"
import { SHOPS, isCommunityStatusActive, formatTimeHM } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Input, Card, Badge } from "@/components/ui"
import {
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconClock,
  IconStarFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconX,
  IconUsers,
} from "@tabler/icons-react"

interface Props {
  theme: Theme
  lang: Lang
  onToggleTheme: () => void
  onToggleLang?: () => void
  onShopSelect: (id: string) => void
  hasActiveBooking: boolean
  bookingPosition: number
  bookingShop: string
  onViewQueue: () => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onViewFavorites: () => void
}

export default function Home({
  theme,
  lang,
  onToggleTheme,
  onShopSelect,
  hasActiveBooking,
  bookingPosition,
  bookingShop,
  onViewQueue,
  favorites,
  onToggleFavorite,
  onViewFavorites,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(0)

  const filtered = SHOPS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.nameAr.includes(query),
  )

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1" dir={dir}>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onToggleTheme}
              className="rounded-full text-sm border-[var(--border)]"
            >
              {theme === "dark" ? (
                <IconSun size={17} stroke={2} className="text-amber-400" />
              ) : (
                <IconMoon size={17} stroke={2} className="text-stone-700" />
              )}
            </Button>
          </div>
          <div dir={dir}>
            <p
              className="text-xs tracking-widest uppercase"
              style={{
                color: C.muted,
                textAlign: lang === "ar" ? "right" : "left",
              }}
            >
              {T.city}
            </p>
            <h1
              className="text-2xl font-light mt-0.5"
              style={{ fontFamily: "var(--font-display)", color: C.text }}
            >
              {T.nearbyBarbers}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onViewFavorites}
              className="rounded-full border-[var(--border)] text-sm relative"
              title={lang === "ar" ? "المفضلة" : "Favorites"}
            >
              <IconHeart
                size={17}
                stroke={1.8}
                className={
                  favorites.length > 0
                    ? "text-rose-500 fill-rose-500/20"
                    : "text-[var(--foreground)]"
                }
              />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold shadow-xs">
                  {favorites.length}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full border-[var(--border)] text-sm"
            >
              <IconBell
                size={17}
                stroke={1.8}
                className="text-[var(--foreground)]"
              />
            </Button>
          </div>
        </div>

        {/* Search input with Tabler IconSearch */}
        <div className="mt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={T.search}
            dir={dir}
            startIcon={
              <IconSearch
                size={18}
                stroke={2}
                className="text-[var(--muted-foreground)]"
              />
            }
          />
        </div>
      </div>

      {/* Category chips using unified Badge */}
      {/*<div className="px-5 mb-4 flex gap-2" dir={dir}>
        {[T.catBarbers].map((cat, i) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(i)}
            className="focus:outline-none"
          >
            <Badge
              variant={selectedCategory === i ? "default" : "secondary"}
              className={`cursor-pointer px-4 py-1.5 transition-all text-xs font-medium rounded-full ${
                selectedCategory !== i ? "opacity-75 hover:opacity-100" : ""
              }`}
            >
              {cat}
            </Badge>
          </button>
        ))}
      </div>*/}

      {/* Active booking banner */}
      {hasActiveBooking && (
        <div className="px-5 mb-3">
          <Card
            interactive
            onClick={onViewQueue}
            className="px-4 py-3 bg-[var(--primary)]/10 border-[var(--primary)]/40 rounded-2xl flex items-center justify-between"
            dir={dir}
          >
            <div className="flex items-center gap-1.5 text-[var(--primary)]">
              <div className="w-2 h-2 rounded-full animate-pulse bg-[var(--primary)]" />
              <span className="text-xs font-semibold">{T.viewQueue}</span>
              {dir === "rtl" ? (
                <IconChevronLeft size={14} stroke={2.5} />
              ) : (
                <IconChevronRight size={14} stroke={2.5} />
              )}
            </div>
            <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
              <p className="text-xs font-semibold text-[var(--foreground)]">
                {T.activeBooking} — {bookingShop}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {T.position} #{bookingPosition}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Shops list using unified Card component */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3" dir={dir}>
        {filtered.map((shop) => (
          <Card
            key={shop.id}
            interactive
            onClick={() => onShopSelect(shop.id)}
            className="overflow-hidden rounded-2xl border-[var(--border)] bg-[var(--card)] p-0"
            style={{ textAlign: dir === "rtl" ? "right" : "left" }}
          >
            <div className="relative h-36 w-full overflow-hidden bg-[var(--card-alt)]">
              <img
                src={shop.photo}
                alt={shop.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
                }}
              />
              {shop.isOpen && (
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="success"
                    size="sm"
                    className="bg-black/60 backdrop-blur-md gap-1 font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {T.open}
                  </Badge>
                </div>
              )}
              {!shop.isOpen && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px] flex items-center justify-center z-10 pointer-events-none">
                  <Badge
                    variant="destructive"
                    className="bg-black/80 border border-red-500/60 text-white text-sm font-bold px-4 py-1.5 shadow-2xl backdrop-blur-md gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>{T.closed}</span>
                  </Badge>
                </div>
              )}
              {isCommunityStatusActive(shop) && (
                <div className="absolute top-3 left-3 z-20">
                  <Badge
                    variant="subtle"
                    size="sm"
                    className="bg-black/65 backdrop-blur-md text-[10px] text-zinc-200 border-amber-500/30 gap-1 font-medium"
                  >
                    <IconUsers size={13} stroke={2} className="text-[var(--primary)]" />
                    {T.communityUpdateWithTime(
                      formatTimeHM(shop.communityUpdate?.updatedAt, lang),
                    )}
                  </Badge>
                </div>
              )}
              {shop.isOpen && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white">
                  <IconClock
                    size={13}
                    stroke={2}
                    className="text-[var(--primary)]"
                  />
                  <span>
                    {shop.waitingCount} {T.waiting}
                  </span>
                </div>
              )}
              {/* Quick Favorite Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onToggleFavorite(shop.id)
                }}
                className="absolute bottom-3 left-3 z-20 w-8 h-8 rounded-full bg-black/65 backdrop-blur-md flex items-center justify-center transition-transform active:scale-85 hover:scale-110 cursor-pointer shadow-md"
                title={
                  favorites.includes(shop.id)
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
                    favorites.includes(shop.id)
                      ? "text-rose-500 fill-rose-500"
                      : "text-white"
                  }
                />
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <IconStarFilled size={13} className="text-[var(--primary)]" />
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {shop.rating}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    ({shop.reviewCount})
                  </span>
                </div>
                <p className="font-semibold text-sm text-[var(--foreground)] flex items-center">
                  {lang === "ar" ? shop.nameAr : shop.name}
                  {shop.isVerified && (
                    <IconCheck
                      size={14}
                      stroke={3}
                      className="mr-1 text-[var(--primary)]"
                    />
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-[var(--muted-foreground)]">
                <span>{shop.distance}</span>
                <p>{shop.address}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
