import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { SHOPS, notifyCommunitySync } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Badge, ShopCard } from "@/components/ui"
import { CommunityUpdateBottomSheet } from "@/components/bottom-sheets"
import { IconMapPin, IconUsers } from "@tabler/icons-react"

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

function MapController({
  selectedCoords,
  recenterTrigger,
  onMapClick,
}: {
  selectedCoords: [number, number] | null
  recenterTrigger: number
  onMapClick: () => void
}) {
  const map = useMap()
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  useEffect(() => {
    if (!selectedCoords) return
    map.panTo(selectedCoords, {
      animate: true,
      duration: 0.8,
      easeLinearity: 0.25,
    })
  }, [selectedCoords, recenterTrigger, map])

  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent?.target as HTMLElement | null
      if (target && target.closest(".leaflet-marker-icon")) return
      onMapClickRef.current()
    }
    map.on("click", handleMapClick)
    return () => {
      map.off("click", handleMapClick)
    }
  }, [map])

  return null
}

interface Props {
  theme: Theme
  lang: Lang
  onShopSelect: (id: string) => void
  onOpenCommunity?: (id: string) => void
}

export default function MapScreen({
  theme,
  lang,
  onShopSelect,
  onOpenCommunity,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const [selected, setSelected] = useState<string | null>(null)
  const [recenterTrigger, setRecenterTrigger] = useState(0)
  const [showCommunitySheet, setShowCommunitySheet] = useState(false)
  const selectedShop = SHOPS.find((s) => s.id === selected)

  const handleSelectShop = (shopId: string) => {
    setSelected(shopId)
    setRecenterTrigger((prev) => prev + 1)
  }

  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

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
          <TileLayer
            url={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
            className={
              theme === "dark" ? "brightness-[0.88] contrast-[1.05]" : ""
            }
          />
          <FitBounds />
          <MapController
            selectedCoords={
              selected && COORDS[selected] ? COORDS[selected] : null
            }
            recenterTrigger={recenterTrigger}
            onMapClick={() => setSelected(null)}
          />
          {SHOPS.map((shop) => {
            const coords = COORDS[shop.id]
            if (!coords) return null
            const isSelected = selected === shop.id
            return (
              <Marker
                key={shop.id}
                position={coords}
                zIndexOffset={isSelected ? 1000 : 0}
                icon={createShopIcon(shop.isOpen, isSelected, C.gold)}
                eventHandlers={{
                  click: (e) => {
                    if (e.originalEvent) {
                      e.originalEvent.stopPropagation()
                    }
                    handleSelectShop(shop.id)
                  },
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

      {/* Selected Shop popup card - Clickable to open shop details */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[999] transition-all duration-300"
        style={{
          transform: selected ? "translateY(0)" : "translateY(100%)",
          padding: "0 16px 20px",
        }}
      >
        {selectedShop && (
          <ShopCard
            shop={selectedShop}
            onClick={() => onShopSelect(selectedShop.id)}
            lang={lang}
            dir={dir}
            action={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onOpenCommunity) {
                    onOpenCommunity(selectedShop.id)
                  } else {
                    setShowCommunitySheet(true)
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-[var(--primary)]/20 shadow-2xs"
                title={lang === "ar" ? "تحديث المجتمع" : "Community Update"}
              >
                <IconUsers size={12} stroke={2.2} />
                <span>{lang === "ar" ? "تحديث المجتمع" : "Community"}</span>
              </button>
            }
          />
        )}
      </div>

      {/* Community Update Modal Fallback */}
      {showCommunitySheet && selectedShop && (
        <CommunityUpdateBottomSheet
          open={showCommunitySheet}
          onClose={() => setShowCommunitySheet(false)}
          lang={lang}
          shopName={lang === "ar" ? selectedShop.nameAr : selectedShop.name}
          onSubmitSuccess={(newInput) => {
            if (newInput && selectedShop) {
              try {
                let existingData: any = null
                const saved = localStorage.getItem(
                  `community_data_${selectedShop.id}`,
                )
                if (saved) existingData = JSON.parse(saved)
                else
                  existingData = (selectedShop as any).communityUpdate || {
                    updatedAt: new Date().toISOString(),
                    isOpen: true,
                    waitingCount: 0,
                    openCount: 0,
                    closedCount: 0,
                    reports: [],
                  }

                const newReport = {
                  id: `rep-${Date.now()}`,
                  userName:
                    lang === "ar"
                      ? "أنت (مساهم مجتمعي)"
                      : "You (Community Member)",
                  userAvatar:
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format",
                  isOpen: newInput.isOpen,
                  waitingCount: newInput.waitingCount,
                  time: new Date().toISOString(),
                  note: newInput.note,
                  photo: newInput.photo,
                  confirmedCount: 1,
                }

                const updated = {
                  updatedAt: new Date().toISOString(),
                  isOpen: newInput.isOpen,
                  waitingCount: newInput.waitingCount,
                  openCount: newInput.isOpen
                    ? (existingData.openCount || 0) + 1
                    : existingData.openCount || 0,
                  closedCount: !newInput.isOpen
                    ? (existingData.closedCount || 0) + 1
                    : existingData.closedCount || 0,
                  reports: [newReport, ...(existingData.reports || [])],
                }

                localStorage.setItem(
                  `community_data_${selectedShop.id}`,
                  JSON.stringify(updated),
                )
                notifyCommunitySync(selectedShop.id)
              } catch {}
            }
            setShowCommunitySheet(false)
          }}
        />
      )}

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
