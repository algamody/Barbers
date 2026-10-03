import { useState } from "react"
import { SHOPS } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Badge, SearchBar, ShopCard, BackButton } from "@/components/ui"
import { IconHeart } from "@tabler/icons-react"

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
          <BackButton
            variant="ghost"
            dir={dir}
            onClick={onBack}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          />

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
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={
                lang === "ar"
                  ? "ابحث في صالوناتك المفضلة..."
                  : "Search in your favorites..."
              }
              lang={lang}
              dir={dir}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 pb-10 space-y-3"
        dir={dir}
      >
        {filtered.length > 0 ? (
          filtered.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              isFavorite={favorites.includes(shop.id)}
              onToggleFavorite={onToggleFavorite}
              onClick={() => onShopSelect(shop.id)}
              lang={lang}
              dir={dir}
            />
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
