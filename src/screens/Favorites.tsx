import { useState } from "react"
import { SHOPS, isCommunityStatusActive, formatTimeHM } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Input, Card, Badge } from "@/components/ui"
import {
  IconArrowLeft,
  IconArrowRight,
  IconHeart,
  IconStarFilled,
  IconClock,
  IconCheck,
  IconSearch,
} from "@tabler/icons-react"

interface Props {
  theme: Theme
  lang: Lang
  onBack: () => void
  onShopSelect: (id: string) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
}

export default function Favorites({
  theme,
  lang,
  onBack,
  onShopSelect,
  favorites,
  onToggleFavorite,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const [query, setQuery] = useState("")

  const favoriteShops = SHOPS.filter((s) => favorites.includes(s.id))

  const filtered = favoriteShops.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.nameAr.includes(query) ||
      s.address.includes(query),
  )

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4 border-b border-[var(--border)] bg-[var(--card)]"
        dir={dir}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {dir === "rtl" ? (
              <IconArrowRight size={20} stroke={2} />
            ) : (
              <IconArrowLeft size={20} stroke={2} />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <h1
              className="text-lg font-bold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              {lang === "ar" ? "قائمة المفضلة" : "Favorite Salons"}
            </h1>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 font-bold"
            >
              {favoriteShops.length}
            </Badge>
          </div>

          <div className="w-8" />
        </div>

        {/* Search within favorites if there are favorites */}
        {favoriteShops.length > 0 && (
          <div className="mt-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "ابحث في صالوناتك المفضلة..."
                  : "Search in your favorites..."
              }
              dir={dir}
              startIcon={
                <IconSearch
                  size={16}
                  stroke={2}
                  className="text-[var(--muted-foreground)]"
                />
              }
              className="h-10 text-xs rounded-xl"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" dir={dir}>
        {filtered.length > 0 ? (
          filtered.map((shop) => (
            <Card
              key={shop.id}
              interactive
              onClick={() => onShopSelect(shop.id)}
              className="overflow-hidden rounded-2xl border-[var(--border)] bg-[var(--card)] p-0 transition-all hover:shadow-md"
              style={{ textAlign: dir === "rtl" ? "right" : "left" }}
            >
              <div className="relative h-40 w-full overflow-hidden bg-[var(--card-alt)]">
                <img
                  src={shop.photo}
                  alt={shop.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                  }}
                />

                {/* Status badge and community status */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant={shop.isOpen ? "success" : "destructive"}
                    size="sm"
                    className="bg-black/60 backdrop-blur-md gap-1 font-semibold"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        shop.isOpen ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {shop.isOpen ? T.open : T.closed}
                  </Badge>
                  {isCommunityStatusActive(shop) && (
                    <Badge
                      variant="subtle"
                      size="sm"
                      className="bg-black/70 backdrop-blur-md text-[10px] text-zinc-200 border-amber-500/30 gap-1 font-medium"
                    >
                      {T.communityUpdateWithTime(
                        formatTimeHM(shop.communityUpdate?.updatedAt, lang),
                      )}
                    </Badge>
                  )}
                </div>

                {/* Remove / Heart button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(shop.id)
                  }}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-rose-500 transition-transform active:scale-90 hover:scale-110 cursor-pointer shadow-sm"
                  title={
                    lang === "ar" ? "إزالة من المفضلة" : "Remove from favorites"
                  }
                >
                  <IconHeart size={18} stroke={2} className="fill-rose-500" />
                </button>

                {/* Waiting queue on bottom right */}
                {shop.isOpen && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-white bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
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
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <IconStarFilled size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {shop.rating}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({shop.reviewCount})
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-1">
                    {lang === "ar" ? shop.nameAr : shop.name}
                    {shop.isVerified && (
                      <IconCheck
                        size={16}
                        stroke={3}
                        className="text-[var(--primary)]"
                      />
                    )}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-[var(--muted-foreground)]">
                  <span>{shop.distance}</span>
                  <p className="truncate max-w-[200px]">{shop.address}</p>
                </div>

                {/* Action button */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <Button
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation()
                      onShopSelect(shop.id)
                    }}
                    className="font-semibold text-xs h-9 rounded-xl"
                  >
                    {lang === "ar"
                      ? "عرض الصالون وحجز الدور"
                      : "View Salon & Queue"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 shadow-inner">
              <IconHeart size={38} stroke={1.5} />
            </div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {query
                ? lang === "ar"
                  ? "لا توجد نتائج مطابقة"
                  : "No matching salons"
                : lang === "ar"
                  ? "قائمة المفضلة فارغة"
                  : "No favorite salons yet"}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5 max-w-xs leading-relaxed">
              {query
                ? lang === "ar"
                  ? "جرّب البحث باسم صالون آخر أو عنوان مختلف"
                  : "Try searching with a different name or keyword"
                : lang === "ar"
                  ? "يمكنك إضافة أي صالون أو مركز إلى قائمة المفضلة بالضغط على أيقونة القلب في صفحته"
                  : "You can add any barbershop to your favorites by tapping the heart icon on its card"}
            </p>
            {!query && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-5 rounded-full px-5 text-xs font-semibold"
              >
                {lang === "ar"
                  ? "استكشف الصالونات القريبة"
                  : "Explore nearby salons"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
