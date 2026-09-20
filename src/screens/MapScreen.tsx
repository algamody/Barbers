import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { SHOPS, isCommunityStatusActive, formatTimeHM } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Card, Badge } from "@/components/ui"
import {
  IconStarFilled,
  IconCheck,
  IconMapPin,
  IconClock,
  IconSparkles,
} from "@tabler/icons-react"

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const COORDS: Record<string, [number, number]> = {
  s1: [32.9028, 13.1794],
  s2: [32.8951, 13.1922],
  s3: [32.8803, 13.2078],
}

function createShopIcon(isOpen: boolean, isSelected: boolean, gold: string) {
  const bg = isSelected ? gold : isOpen ? "#4a8a5a" : "#6a6560"
  const size = isSelected ? 42 : 34
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:${
      isSelected ? `0 4px 20px ${gold}80` : "0 2px 8px rgba(0,0,0,0.4)"
    };border:2.5px solid #ffffff40;display:flex;align-items:center;justify-content:center;">
      <svg style="transform:rotate(45deg);" xmlns="http://www.w3.org/2000/svg" width="${
        isSelected ? 20 : 16
      }" height="${
        isSelected ? 20 : 16
      }" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M6 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M6 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M8.6 8.6l10.4 10.4" />
        <path d="M8.6 15.4l10.4 -10.4" />
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

function FitBounds() {
  const map = useMap()
  useEffect(() => {
    const bounds = Object.values(COORDS)
    if (bounds.length)
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] })
  }, [map])
  return null
}

interface Props {
  theme: Theme
  lang: Lang
  onShopSelect: (id: string) => void
}

export default function MapScreen({ theme, lang, onShopSelect }: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const [selected, setSelected] = useState<string | null>(null)
  const selectedShop = SHOPS.find((s) => s.id === selected)

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ backgroundColor: C.bg }}
    >
      <div
        className="px-5 pt-12 pb-4 z-10 relative"
        style={{ backgroundColor: C.bg }}
        dir={dir}
      >
        <p className="text-xs tracking-widest uppercase mb-0.5 text-[var(--muted-foreground)]">
          {T.map}
        </p>
        <h1
          className="text-2xl font-light text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {T.nearbyBarbers}
        </h1>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={[32.8951, 13.18]}
          zoom={13}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} />
          <FitBounds />
          {SHOPS.map((shop) => {
            const coords = COORDS[shop.id]
            if (!coords) return null
            return (
              <Marker
                key={shop.id}
                position={coords}
                icon={createShopIcon(shop.isOpen, selected === shop.id, C.gold)}
                eventHandlers={{
                  click: () =>
                    setSelected(selected === shop.id ? null : shop.id),
                }}
              />
            )
          })}
        </MapContainer>

        {/* Map legend */}
        <div className="absolute top-3 right-3 z-[999] px-3 py-2 rounded-xl flex flex-col gap-1.5 border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
          {[
            { color: "#4a8a5a", label: T.open },
            { color: "#6a6560", label: T.closed },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2" dir={dir}>
              <span className="text-xs text-[var(--muted-foreground)]">
                {label}
              </span>
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Selected Shop popup card using unified Card & Button */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[999] transition-all duration-300"
        style={{
          transform: selected ? "translateY(0)" : "translateY(100%)",
          padding: "0 16px 20px",
        }}
      >
        {selectedShop && (
          <Card className="rounded-2xl overflow-hidden p-0 border-[var(--border)] bg-[var(--card)] shadow-xl">
            <div className="relative h-28 overflow-hidden bg-[var(--card-alt)]">
              <img
                src={selectedShop.photo}
                alt={selectedShop.name}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
                }}
              />
              {/* Community update badge with time */}
              {isCommunityStatusActive(selectedShop) && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <Badge
                    variant="subtle"
                    size="xs"
                    className="bg-black/70 backdrop-blur-md text-[10px] text-zinc-200 border-amber-500/30 gap-1 font-medium"
                  >
                    {T.communityUpdateWithTime(
                      formatTimeHM(
                        selectedShop.communityUpdate?.updatedAt,
                        lang,
                      ),
                    )}
                  </Badge>
                </div>
              )}
              <div
                className="absolute bottom-3 right-4 left-4 flex items-end justify-between text-white"
                dir={dir}
              >
                <div className="flex items-center gap-1.5">
                  <IconStarFilled size={13} className="text-[var(--primary)]" />
                  <span className="text-xs text-[var(--primary)] font-bold">
                    {selectedShop.rating}
                  </span>
                  <span className="text-xs text-white/70">
                    ({selectedShop.reviewCount})
                  </span>
                </div>
                <div>
                  <p
                    className="text-base font-light flex items-center"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {lang === "ar" ? selectedShop.nameAr : selectedShop.name}
                    {selectedShop.isVerified && (
                      <IconCheck
                        size={14}
                        stroke={3}
                        className="mr-1 text-[var(--primary)]"
                      />
                    )}
                  </p>
                  <p className="text-xs text-white/70">
                    {selectedShop.distance}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="px-4 py-3 flex items-center justify-between"
              dir={dir}
            >
              <Button
                size="sm"
                onClick={() => onShopSelect(selectedShop.id)}
                className="rounded-xl px-5 font-semibold"
              >
                {T.viewShop}
              </Button>
              <div className="flex items-center gap-2" dir={dir}>
                <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                  <p
                    className={`text-xs font-semibold ${
                      selectedShop.isOpen
                        ? "text-emerald-500"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {selectedShop.isOpen
                      ? `${selectedShop.waitingCount} ${T.waiting}`
                      : T.closedNow}
                  </p>
                  <p className="text-[11px] text-[var(--foreground)] font-medium flex items-center gap-1">
                    <IconClock
                      size={12}
                      className="text-[var(--primary)] shrink-0"
                    />
                    <span>
                      {selectedShop.workingHours
                        ? selectedShop.workingHours[lang]
                        : "10:00ص - 12:00م"}
                    </span>
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    {selectedShop.address}
                  </p>
                </div>
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    selectedShop.isOpen ? "bg-emerald-500" : "bg-zinc-500"
                  }`}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {!selected && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-[999]">
          <Badge
            variant="outline"
            size="lg"
            className="rounded-full bg-[var(--card)]/90 backdrop-blur-md shadow-md border-[var(--border)] text-xs gap-1"
            dir={dir}
          >
            <IconMapPin
              size={14}
              stroke={2}
              className="text-[var(--primary)]"
            />
            <span className="font-bold text-[var(--foreground)]">
              {SHOPS.length}
            </span>
            <span>
              {lang === "ar" ? "محلات حلاقة في المنطقة" : "barbershops nearby"}
            </span>
          </Badge>
        </div>
      )}
    </div>
  )
}
