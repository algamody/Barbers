import { useState } from "react"
import { SHOPS } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Card, SearchBar, ShopCard, NotificationDot } from "@/components/ui"
import {
  IconBell,
  IconSun,
  IconMoon,
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
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
              <NotificationDot
                visible={favorites.length > 0}
                count={favorites.length}
              />
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

        {/* Search input with unified SearchBar */}
        <div className="mt-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={T.search}
            lang={lang}
            dir={dir}
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

      {/* Shops list using unified ShopCard component */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3" dir={dir}>
        {filtered.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            isFavorite={favorites.includes(shop.id)}
            onToggleFavorite={onToggleFavorite}
            onClick={() => onShopSelect(shop.id)}
            lang={lang}
            dir={dir}
          />
        ))}
      </div>
    </div>
  )
}
