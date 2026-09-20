import { useState } from "react"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { MY_BOOKING } from "../data"
import { Button, Card, Badge } from "@/components/ui"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import {
  IconCalendarEvent,
  IconClock,
  IconCheck,
  IconStarFilled,
  IconArrowLeft,
  IconArrowRight,
  IconScissors,
  IconMapPin,
  IconSparkles,
  IconX,
  IconQrcode,
  IconScan,
  IconGift,
  IconCircleCheck,
  IconInfoCircle,
  IconCamera,
} from "@tabler/icons-react"
import ReviewBottomSheet from "../components/ReviewBottomSheet"

interface Props {
  theme: Theme
  lang: Lang
  hasActiveBooking: boolean
  onViewQueue: () => void
  onShopSelect?: (shopId: string) => void
  onBookNew?: () => void
  onActivateBooking?: () => void
}

export interface BookingHistoryItem {
  id: string
  shop: string
  shopId?: string
  service: string
  barber: string
  date: string
  price: number
  rating?: number
  reviewComment?: string
  photos?: string[]
}

const INITIAL_PAST_BOOKINGS: BookingHistoryItem[] = [
  {
    id: "bk-101",
    shop: "رويال كت (Royal Cut)",
    shopId: "s1",
    service: "شعر + لحية",
    barber: "محمد الزروق",
    date: "12 سبتمبر 2026",
    price: 22,
    rating: 5,
    reviewComment:
      "حلاقة ممتازة وتحديد لحية دقيق جداً كالعادة، المركز نظيف ومرتب.",
    photos: [
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "bk-102",
    shop: "كلاسيك باربر (Classic Barber)",
    shopId: "s2",
    service: "حلاقة شعر",
    barber: "علي الورفلي",
    date: "5 سبتمبر 2026",
    price: 12,
    rating: 4,
    reviewComment: "خدمة جيدة وسريعة، والالتزام بالوقت كان ممتاز.",
  },
  {
    id: "bk-103",
    shop: "رويال كت (Royal Cut)",
    shopId: "s1",
    service: "حلاقة شعر",
    barber: "خالد المنتصر",
    date: "28 أغسطس 2026",
    price: 15,
    rating: 5,
    reviewComment: "قصة ممتازة واهتمام بأدق التفاصيل.",
    photos: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "bk-104",
    shop: "صالون الأناقة VIP",
    shopId: "s3",
    service: "حلاقة شعر + سشوار",
    barber: "طارق الشريف",
    date: "15 أغسطس 2026",
    price: 18,
  },
]

export default function BookingsScreen({
  theme,
  lang,
  hasActiveBooking: propHasActiveBooking,
  onViewQueue,
  onShopSelect,
  onBookNew,
  onActivateBooking,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"

  // Mode: Default to true (New Account / First-time user)
  const [isNewAccount, setIsNewAccount] = useState<boolean>(true)

  // Active QR check-in state
  const [localActiveBooking, setLocalActiveBooking] = useState<{
    shopName: string
    staffName: string
    service: string
    position: number
    estimatedWait: number
    hasQrBonus: boolean
  } | null>(null)

  const hasLiveBooking = propHasActiveBooking || localActiveBooking !== null

  // Past bookings & review state
  const [pastBookings, setPastBookings] = useState<BookingHistoryItem[]>(
    INITIAL_PAST_BOOKINGS,
  )
  const [reviewingBooking, setReviewingBooking] =
    useState<BookingHistoryItem | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{
    url: string
    title: string
  } | null>(null)

  // QR Scanner Modal states
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleReviewSubmit = (reviewData: {
    rating: number
    comment: string
    photos?: string[]
  }) => {
    if (!reviewingBooking) return
    setPastBookings((prev) =>
      prev.map((item) =>
        item.id === reviewingBooking.id
          ? {
              ...item,
              rating: reviewData.rating,
              reviewComment: reviewData.comment,
              photos:
                reviewData.photos && reviewData.photos.length > 0
                  ? reviewData.photos
                  : undefined,
            }
          : item,
      ),
    )
  }

  // Perform QR Check-in
  const handleQrCheckIn = (shopName: string, staffName: string) => {
    setLocalActiveBooking({
      shopName,
      staffName,
      service:
        lang === "ar"
          ? "حلاقة شعر ولحية (تسجيل QR)"
          : "Haircut & Beard (QR Check-in)",
      position: 2,
      estimatedWait: 20,
      hasQrBonus: true,
    })
    onActivateBooking?.()
    setShowQrScanner(false)
    setToastMessage(
      lang === "ar"
        ? `تم مسح QR ${shopName} بنجاح! تم حجز دورك وتفعيل مكافأة 5 د.ل الترحيبية.`
        : `QR code scanned! Joined queue at ${shopName} with 5 LYD welcome bonus.`,
    )
    setTimeout(() => setToastMessage(null), 4500)
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      {/* Top Header */}
      <div
        className="px-5 pt-12 pb-3.5 border-b border-[var(--border)]"
        dir={dir}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-light text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {T.myBookings}
            </h2>
            <p className="text-xs mt-0.5 text-[var(--muted-foreground)]">
              {isNewAccount
                ? lang === "ar"
                  ? "حساب جديد • تسجيل أول زيارة ومسح الـ QR"
                  : "New Account • First-time QR check-in"
                : lang === "ar"
                  ? "متابعة الحجز المباشر وسجل الزيارات السابقة"
                  : "Track live queue and past visit history"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center shadow-2xs">
            <IconCalendarEvent size={22} stroke={2} />
          </div>
        </div>

        {/* Mode Switcher Toggle: New Account vs Active Account */}
        <div className="flex items-center gap-1.5 p-1 mt-3 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]/70">
          <button
            type="button"
            onClick={() => setIsNewAccount(true)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              isNewAccount
                ? "bg-[var(--card)] text-[var(--primary)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <IconQrcode size={14} stroke={2.4} />
            <span>
              {lang === "ar"
                ? "حساب جديد (أول زيارة)"
                : "New Account (First Visit)"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewAccount(false)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              !isNewAccount
                ? "bg-[var(--card)] text-[var(--primary)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <IconCheck size={14} stroke={2.4} />
            <span>
              {lang === "ar"
                ? "حساب نشط (سجل الحجوزات)"
                : "Active Account (History)"}
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 pb-28 space-y-4"
        dir={dir}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg bg-emerald-500/15 border border-emerald-500/30 animate-sheet-enter"
            dir={dir}
          >
            <IconCircleCheck
              size={22}
              stroke={2}
              className="text-emerald-500 shrink-0"
            />
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {toastMessage}
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CASE A: Active Live Booking Exists (From QR scan or App booking) */}
        {/* ------------------------------------------------------------- */}
        {hasLiveBooking ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>
                  {lang === "ar"
                    ? "حجز مباشر ونشط الآن"
                    : "Live Active Booking"}
                </span>
              </span>
              <Badge
                variant="success"
                className="text-[10px] px-2 py-0.5 font-bold"
              >
                {lang === "ar" ? "في الطابور" : "In Queue"}
              </Badge>
            </div>

            <Card className="rounded-3xl p-5 border-[var(--primary)]/40 bg-[var(--card)] shadow-md space-y-4">
              <div className="flex items-start justify-between">
                <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {localActiveBooking?.shopName || MY_BOOKING.shopName}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {localActiveBooking?.staffName || MY_BOOKING.staffName} ·{" "}
                    {localActiveBooking?.service || MY_BOOKING.service}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] text-black flex items-center justify-center shrink-0 shadow-xs">
                  <IconScissors size={20} stroke={2.2} />
                </div>
              </div>

              {/* QR First-time bonus badge (Section 4 & 8.3 of Technical Doc) */}
              {(localActiveBooking?.hasQrBonus || isNewAccount) && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                  <IconGift size={18} stroke={2.2} className="shrink-0" />
                  <span className="font-semibold">
                    {lang === "ar"
                      ? "مكافأة أول زيارة مفعلة: 5.00 د.ل ستُودع في محفظتك فور إتمام الحلاقة!"
                      : "First cut reward active: 5.00 LYD will be credited upon completion!"}
                  </span>
                </div>
              )}

              {/* Position and Wait Stats */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] block font-semibold">
                    {T.position}
                  </span>
                  <span className="text-xl font-bold text-[var(--primary)]">
                    #{localActiveBooking?.position || MY_BOOKING.position}
                  </span>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] block font-semibold">
                    {T.approxWait}
                  </span>
                  <span className="text-xl font-bold text-[var(--foreground)]">
                    ~
                    {localActiveBooking?.estimatedWait ||
                      MY_BOOKING.estimatedWait}{" "}
                    {T.min}
                  </span>
                </div>
              </div>

              <Button
                size="default"
                fullWidth
                onClick={onViewQueue}
                className="rounded-2xl font-semibold gap-2 shadow-xs cursor-pointer h-11"
              >
                <span>
                  {lang === "ar"
                    ? "متابعة تفاصيل الطابور المباشر"
                    : "View Live Queue"}
                </span>
                {dir === "rtl" ? (
                  <IconArrowLeft size={16} />
                ) : (
                  <IconArrowRight size={16} />
                )}
              </Button>
            </Card>
          </div>
        ) : null}

        {/* ------------------------------------------------------------- */}
        {/* CASE B: New Account Mode without Active Booking (The User's Scenario) */}
        {/* ------------------------------------------------------------- */}
        {isNewAccount && !hasLiveBooking ? (
          <div className="space-y-4">
            {/* Main Hero Card: QR Scan for First-time Customers */}
            <Card className="rounded-3xl p-5 border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
              <div className="text-center space-y-2">
                {/* Big QR Icon Container with Glowing Rings */}
                <div className="relative w-18 h-18 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-[var(--primary)]/15 animate-ping opacity-35" />
                  <div className="relative w-18 h-18 rounded-3xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] flex items-center justify-center shadow-sm">
                    <IconQrcode size={36} stroke={1.8} />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-bold border border-[var(--primary)]/20 mt-1">
                  <IconGift size={13} stroke={2.5} />
                  <span>
                    {lang === "ar"
                      ? "حساب جديد • مكافأة ترحيبية 5 د.ل"
                      : "New Account • 5 LYD Welcome Gift"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)] pt-1">
                  {lang === "ar"
                    ? "امسح QR المركز لبدء حجزك الأول"
                    : "Scan Salon QR to Start Your First Cut"}
                </h3>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto">
                  {lang === "ar"
                    ? "وفقاً للنظام، في أول زيارة لك امسح رمز الـ QR المعروض لدى الصالون لتسجيل دورك في الطابور المباشر وتفعيل مكافأتك الترحيبية."
                    : "For your first visit, scan the salon's QR code on-site to immediately join the live queue and claim your welcome bonus."}
                </p>
              </div>

              {/* Primary Action Button: Open Scanner */}
              <Button
                size="lg"
                fullWidth
                onClick={() => setShowQrScanner(true)}
                className="rounded-2xl h-12 font-bold shadow-md gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <IconScan size={20} stroke={2.2} />
                <span>
                  {lang === "ar" ? "مسح QR المركز الآن" : "Scan Salon QR Now"}
                </span>
              </Button>
            </Card>

            {/* Alternative: Not at the shop right now? Browse remote booking */}
            <Card className="rounded-2xl p-4 border-[var(--border)] bg-[var(--card)] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
                <IconInfoCircle
                  size={17}
                  stroke={2}
                  className="text-[var(--primary)] shrink-0"
                />
                <span>
                  {lang === "ar"
                    ? "لست متواجداً في الصالون حالياً؟"
                    : "Not at the salon right now?"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {lang === "ar"
                  ? "يمكنك استكشاف صالونات الحلاقة القريبة عبر الخريطة ومعرفة أوقات الانتظار والحجز المباشر عن بُعد."
                  : "Explore nearby barbershops on the map, check live wait times, and reserve remotely."}
              </p>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={onBookNew}
                className="rounded-xl text-xs font-semibold h-9 cursor-pointer gap-1.5"
              >
                <IconMapPin size={15} />
                <span>
                  {lang === "ar"
                    ? "استكشاف الصالونات القريبة"
                    : "Explore Nearby Salons"}
                </span>
              </Button>
            </Card>
          </div>
        ) : null}

        {/* ------------------------------------------------------------- */}
        {/* CASE C: Active Account Mode (Past History & Reviews) */}
        {/* ------------------------------------------------------------- */}
        {!isNewAccount && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase font-semibold text-[var(--muted-foreground)]">
                {lang === "ar"
                  ? "سجل الحجوزات السابقة"
                  : "Past Bookings History"}
              </span>
              <span className="text-xs text-[var(--muted-foreground)] font-medium">
                {pastBookings.length} {lang === "ar" ? "زيارات" : "visits"}
              </span>
            </div>

            <div className="space-y-3">
              {pastBookings.map((bk) => {
                const hasRating = typeof bk.rating === "number" && bk.rating > 0

                return (
                  <Card
                    key={bk.id}
                    className="rounded-2xl p-4 border-[var(--border)] bg-[var(--card)] space-y-3 shadow-2xs hover:border-[var(--primary)]/30 transition-colors"
                  >
                    {/* Top line: shop, price, date */}
                    <div className="flex items-start justify-between">
                      <div
                        style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                      >
                        <h4
                          onClick={() => bk.shopId && onShopSelect?.(bk.shopId)}
                          className={`text-sm font-bold text-[var(--foreground)] ${
                            bk.shopId
                              ? "cursor-pointer hover:text-[var(--primary)] transition-colors"
                              : ""
                          }`}
                        >
                          {bk.shop}
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {bk.service} · {bk.barber}
                        </p>
                      </div>

                      <div className="text-end">
                        <span className="text-sm font-bold text-[var(--primary)]">
                          {bk.price} LYD
                        </span>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                          {bk.date}
                        </p>
                      </div>
                    </div>

                    {/* Rating / Review block */}
                    <div className="pt-2 border-t border-[var(--border)]">
                      {hasRating ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, starIdx) => (
                                  <IconStarFilled
                                    key={starIdx}
                                    size={12}
                                    className={
                                      starIdx < (bk.rating ?? 0)
                                        ? "text-[var(--primary)]"
                                        : "text-zinc-300 dark:text-zinc-700"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {bk.reviewComment && (
                            <p className="text-xs leading-relaxed text-[var(--muted-foreground)] bg-[var(--muted)]/40 p-2.5 rounded-xl border border-[var(--border)]/50">
                              "{bk.reviewComment}"
                            </p>
                          )}

                          {/* Review Attached Photos */}
                          {bk.photos && bk.photos.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
                              {bk.photos.map((photoUrl, pIdx) => (
                                <div
                                  key={pIdx}
                                  onClick={() =>
                                    setLightboxImage({
                                      url: photoUrl,
                                      title: `${bk.shop} · ${bk.service}`,
                                    })
                                  }
                                  className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-[var(--border)] group hover:scale-105 active:scale-95 transition-transform"
                                >
                                  <img
                                    src={photoUrl}
                                    alt="Review attachment"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                            <IconSparkles
                              size={14}
                              className="text-amber-500"
                            />
                            <span>
                              {lang === "ar"
                                ? "لم تقم بتقييم هذه الزيارة بعد"
                                : "Not rated yet"}
                            </span>
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewingBooking(bk)}
                            className="h-7 px-3 text-xs rounded-xl border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black font-semibold cursor-pointer"
                          >
                            {lang === "ar" ? "تقييم الزيارة" : "Rate Visit"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QR Scanner Interactive Bottom Sheet Modal */}
      {/* ------------------------------------------------------------- */}
      <BottomSheet
        open={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        title={lang === "ar" ? "مسح QR المركز" : "Scan Salon QR"}
        description={
          lang === "ar"
            ? "وجّه الكاميرا نحو رمز QR المعروض في صالون الحلاقة"
            : "Align camera viewfinder with the salon QR code"
        }
        dir={dir}
      >
        <div className="space-y-4 py-2" dir={dir}>
          {/* Simulated High-tech Camera Viewfinder */}
          <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
            />

            {/* 4 Corner Targeting Reticles */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-[var(--primary)] rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-[var(--primary)] rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-[var(--primary)] rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-[var(--primary)] rounded-br-lg" />

            {/* Animated Laser Scanning Line */}
            <div
              className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent shadow-[0_0_12px_var(--primary)]"
              style={{
                animation: "laserScan 2.4s ease-in-out infinite",
              }}
            />

            {/* Central QR Silhouette */}
            <div className="text-zinc-700 flex flex-col items-center gap-2">
              <IconQrcode size={64} stroke={1.2} className="opacity-40" />
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
                SCANNING QR...
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            {lang === "ar"
              ? "يوجد رمز الـ QR عادةً على مكتب الاستقبال أو مرآة كرسي الحلاقة"
              : "Look for the QR badge at the reception desk or mirror"}
          </p>

          {/* Quick Simulation Options for Demonstration */}
          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-bold text-[var(--muted-foreground)] text-center">
              {lang === "ar"
                ? "محاكاة مسح QR للمراكز (للتجربة)"
                : "Simulate QR Scan for Centers"}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleQrCheckIn("رويال كت (Royal Cut)", "محمد الزروق")
                }
                className="rounded-xl text-xs h-10 border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 font-bold cursor-pointer"
              >
                <span>رويال كت (Royal Cut)</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleQrCheckIn(
                    "كلاسيك باربر (Classic Barber)",
                    "علي الورفلي",
                  )
                }
                className="rounded-xl text-xs h-10 border-[var(--border)] hover:bg-[var(--secondary)] font-bold cursor-pointer"
              >
                <span>كلاسيك باربر</span>
              </Button>
            </div>
          </div>

          {/* Manual Code Fallback */}
          {/*<div className="pt-2 border-t border-[var(--border)]/70">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "أو أدخل كود الصالون يدوياً (RC-101)..."
                    : "Or enter code (e.g. RC-101)..."
                }
                className="flex-1 h-9 px-3 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)] font-mono"
                dir={dir}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (manualCode.trim()) {
                    handleQrCheckIn("صالون الحلاقة (كود يدوي)", "الحلاق المتاح")
                  }
                }}
                disabled={!manualCode.trim()}
                className="rounded-xl h-9 px-3.5 text-xs font-bold cursor-pointer"
              >
                {lang === "ar" ? "تأكيد" : "Confirm"}
              </Button>
            </div>
          </div>*/}
        </div>
      </BottomSheet>

      {/* Review BottomSheet Modal when rating an unrated past booking */}
      {reviewingBooking && (
        <ReviewBottomSheet
          open={!!reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          lang={lang}
          shopName={reviewingBooking.shop}
          defaultService={reviewingBooking.service}
          onSubmitSuccess={(data) => {
            handleReviewSubmit({
              rating: data.rating,
              comment: data.comment,
              photos: data.photos,
            })
          }}
        />
      )}

      {/* Lightbox Fullscreen Preview Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
          dir={dir}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/30 transition-colors z-10 cursor-pointer"
          >
            <IconX size={20} stroke={2.5} />
          </button>

          <div
            className="relative max-w-sm w-full bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-3 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            {lightboxImage.title && (
              <p className="text-center text-sm font-semibold text-white px-2 pb-1">
                {lightboxImage.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Keyframe animation for QR scanner laser */}
      <style>{`
        @keyframes laserScan {
          0% { top: 12%; opacity: 0.8; }
          50% { top: 86%; opacity: 1; }
          100% { top: 12%; opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
