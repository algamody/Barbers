import { useState, useEffect, useMemo } from "react"
import { SHOPS, CommunityUpdateData, formatTimeHM, isToday } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import {
  Button,
  Card,
  Badge,
  Avatar,
  AvatarImage,
  Tabs,
  TabsList,
  TabsTrigger,
  Rating,
  showSnackbar,
  NotificationDot,
  StatusChip,
  BackButton,
} from "@/components/ui"
import { ServiceSelectionBottomSheet } from "@/components/bottom-sheets"
import {
  IconClock,
  IconBolt,
  IconCheck,
  IconHeart,
  IconX,
  IconPlus,
  IconSparkles,
  IconMapPin,
  IconStar,
  IconScissors,
  IconCamera,
  IconShare,
  IconFlame,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react"
import CommunityUpdates from "../components/CommunityUpdates"

interface Props {
  shopId: string
  theme: Theme
  lang: Lang
  onBack?: () => void
  onBook: (
    shopId: string,
    serviceId: string,
    addonIds?: string[],
    resumeStep?: "barber" | "group_list" | "confirm",
  ) => void
  onClaimSlot?: (
    shopId: string,
    staffId: string,
    fee: number,
    serviceId: string,
    addonIds: string[],
  ) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onOpenCommunity: (shopId: string) => void
  addingPersonName?: string
  onBackToGroup?: () => void
  initialTab?: string
  reopenClaimedSlot?: {
    staffId?: string
    fee?: number
    serviceId?: string
    addonIds?: string[]
  } | null
}

export default function ShopDetail({
  shopId,
  theme,
  lang,
  onBack,
  onBook,
  onClaimSlot,
  isFavorite,
  onToggleFavorite,
  onOpenCommunity,
  addingPersonName,
  onBackToGroup,
  initialTab,
  reopenClaimedSlot,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const shop = SHOPS.find((s) => s.id === shopId)!
  const [tab, setTab] = useState<string>(
    initialTab || (reopenClaimedSlot?.staffId ? "staff" : "services"),
  )

  const savedDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(`draft_booking_${shopId}`)
      if (raw) return JSON.parse(raw)
    } catch {}
    return null
  }, [shopId])

  const [selectedService, setSelectedService] = useState<string | null>(() => {
    if (addingPersonName) return null
    if (
      savedDraft?.serviceId &&
      shop.services.some((s) => s.id === savedDraft.serviceId)
    ) {
      return savedDraft.serviceId
    }
    return null
  })
  const [selectedAddons, setSelectedAddons] = useState<string[]>(() => {
    if (addingPersonName) return []
    if (savedDraft?.addonIds && Array.isArray(savedDraft.addonIds)) {
      return savedDraft.addonIds
    }
    return []
  })

  const hasActiveDraft = Boolean(
    !addingPersonName &&
      savedDraft &&
      ((savedDraft.persons && savedDraft.persons.length > 1) ||
        savedDraft.step === "group_list" ||
        savedDraft.step === "confirm" ||
        savedDraft.selectedStaff),
  )

  const [claimedSlotBooking, setClaimedSlotBooking] = useState<{
    staffId: string
    fee: number
    serviceId?: string
    addonIds?: string[]
  } | null>(() => {
    if (reopenClaimedSlot?.staffId) {
      return {
        staffId: reopenClaimedSlot.staffId,
        fee: reopenClaimedSlot.fee ?? 5,
        serviceId: reopenClaimedSlot.serviceId,
        addonIds: reopenClaimedSlot.addonIds,
      }
    }
    return null
  })
  const [isClaimedServiceSheetOpen, setIsClaimedServiceSheetOpen] =
    useState<boolean>(() => !!reopenClaimedSlot?.staffId)

  const [hasDismissedStaffNotification, setHasDismissedStaffNotification] =
    useState<boolean>(
      () => initialTab === "staff" || !!reopenClaimedSlot?.staffId,
    )
  const [
    hasDismissedCommunityNotification,
    setHasDismissedCommunityNotification,
  ] = useState<boolean>(false)

  useEffect(() => {
    if (reopenClaimedSlot?.staffId) {
      setTab("staff")
      setClaimedSlotBooking({
        staffId: reopenClaimedSlot.staffId,
        fee: reopenClaimedSlot.fee ?? 5,
        serviceId: reopenClaimedSlot.serviceId,
        addonIds: reopenClaimedSlot.addonIds,
      })
      setIsClaimedServiceSheetOpen(true)
    }
  }, [reopenClaimedSlot])

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    )
  }

  const [communityData, setCommunityData] =
    useState<CommunityUpdateData | null>(() => {
      try {
        const saved = localStorage.getItem(`community_data_${shop.id}`)
        if (saved) return JSON.parse(saved)
      } catch {}
      return (shop as any).communityUpdate || null
    })
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [isSimulatedYesterday, setIsSimulatedYesterday] = useState(false)

  const handleUpdateCommunityData = (updated: CommunityUpdateData) => {
    setCommunityData(updated)
    try {
      localStorage.setItem(`community_data_${shop.id}`, JSON.stringify(updated))
    } catch {}
  }

  const effectiveCommunityUpdatedAt = isSimulatedYesterday
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : communityData?.updatedAt

  const isCommunityActiveToday =
    !shop.isVerified &&
    !!effectiveCommunityUpdatedAt &&
    isToday(effectiveCommunityUpdatedAt)

  const communityTimeFormatted = isCommunityActiveToday
    ? formatTimeHM(effectiveCommunityUpdatedAt, lang)
    : ""

  const currentIsOpen = shop.isVerified
    ? shop.isOpen
    : isCommunityActiveToday
      ? (communityData?.isOpen ?? shop.isOpen)
      : shop.isOpen

  const currentWaitingCount = shop.isVerified
    ? shop.waitingCount
    : isCommunityActiveToday
      ? (communityData?.waitingCount ?? shop.waitingCount)
      : shop.waitingCount

  const hasCommunityUpdateToday =
    !!communityData &&
    (communityData.openCount > 0 ||
      communityData.closedCount > 0 ||
      (communityData.reports && communityData.reports.length > 0)) &&
    (!effectiveCommunityUpdatedAt || isToday(effectiveCommunityUpdatedAt))

  const [altSecsMap, setAltSecsMap] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {}
    shop.staff.forEach((st) => {
      if (st.altBooking) m[st.id] = st.altBooking.openWindowSeconds
    })
    return m
  })
  const [altClaimed, setAltClaimed] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`claimed_slots_${shop.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const hasStaffWithConfirmedSlot = shop.staff.some((st) => {
    const isInactive = st.isActive === false
    const secs = altSecsMap[st.id] ?? 0
    const claimed = altClaimed[st.id]
    return !isInactive && !!st.altBooking && !claimed && secs > 0
  })

  const showStaffNotification =
    hasStaffWithConfirmedSlot &&
    !hasDismissedStaffNotification &&
    tab !== "staff"

  const showCommunityNotification =
    hasCommunityUpdateToday && !hasDismissedCommunityNotification

  const [lightboxImage, setLightboxImage] = useState<{
    url: string
    title: string
  } | null>(null)

  const [reviewsList, setReviewsList] = useState(
    (shop as any).reviews || [
      {
        id: "rv1",
        name: "عمر الجهاني",
        rating: 5,
        text: "أفضل حلاق جربته في طرابلس، دقيق ومحترف وهذي النتيجة بعد الحلاقة والتحديد.",
        time: "منذ يومين",
        serviceUsed: "شعر + لحية",
        photos: [
          "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop&auto=format",
        ],
      },
      {
        id: "rv2",
        name: "سالم المنتصر",
        rating: 5,
        text: "التطبيق سهّل معرفة وقت الانتظار بدقة، والمحل غاية في النظافة والترتيب واستقبال الزبائن ممتاز.",
        time: "منذ أسبوع",
        serviceUsed: "حلاقة شعر",
        photos: [
          "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&auto=format",
        ],
      },
      {
        id: "rv3",
        name: "فراس القيسي",
        rating: 4,
        text: "خدمة جيدة وسريعة، الحلاق طارق محترف جداً وتعامل راقي.",
        time: "منذ أسبوعين",
        serviceUsed: "حلاقة لحية",
        photos: [],
      },
      {
        id: "rv4",
        name: "مهند الورفلي",
        rating: 5,
        text: "صوّرت شغلي بعد التحديد مباشرة، شغل متقن وسعر ممتاز مقابل الخدمة المقدمة.",
        time: "منذ 3 أسابيع",
        serviceUsed: "شعر + لحية",
        photos: [
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&auto=format",
        ],
      },
    ],
  )

  const galleryItems = (shop as any).galleryPhotos || [
    {
      id: "gp1",
      url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=800&fit=crop&auto=format",
      title: "تحديد لحية واحترافية التدرج",
      category: "beard",
      categoryAr: "لحية ودقن",
    },
    {
      id: "gp2",
      url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format",
      title: "قصة شعر عصرية لأحد زبائننا",
      category: "haircuts",
      categoryAr: "قصات شعر",
    },
    {
      id: "gp3",
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=800&fit=crop&auto=format",
      title: "كراسي صالون رويال كت وتجهيزات VIP",
      category: "interior",
      categoryAr: "داخل الصالون",
    },
    {
      id: "gp4",
      url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=800&fit=crop&auto=format",
      title: "جلسة حلاقة وتصفيف مع الحلاق محمد",
      category: "customers",
      categoryAr: "زبائن أثناء الحلاقة",
    },
    {
      id: "gp5",
      url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=800&fit=crop&auto=format",
      title: "عناية متكاملة ومنتجات أصلية معقمة",
      category: "interior",
      categoryAr: "داخل الصالون",
    },
    {
      id: "gp6",
      url: "https://images.unsplash.com/photo-1517832606589-7157be569300?w=800&h=800&fit=crop&auto=format",
      title: "حلاقة وتحديد فيد لأحد زبائن المركز",
      category: "customers",
      categoryAr: "زبائن أثناء الحلاقة",
    },
  ]

  useEffect(() => {
    const ids = shop.staff
      .filter((s) => s.altBooking && !altClaimed[s.id])
      .map((s) => s.id)
    if (!ids.length) return
    const t = setInterval(() => {
      setAltSecsMap((prev) => {
        const next = { ...prev }
        ids.forEach((id) => {
          if ((next[id] ?? 0) > 0) next[id] -= 1
        })
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [shop.staff, altClaimed])

  const baseService = shop.services.find((s) => s.id === selectedService)
  const addonsTotal = shop.addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)
  const totalPrice = baseService ? baseService.price + addonsTotal : 0

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Cover Image & Header */}
      <div className="relative h-52 flex-shrink-0 bg-[var(--card)]">
        <img
          src={shop.photo}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 60%)",
          }}
        />
        {/* Top bar with back and favorite buttons */}
        <div
          className="absolute top-12 left-4 right-4 flex items-center justify-between z-10"
          dir={dir}
        >
          <BackButton
            variant="secondary"
            dir={dir}
            onClick={addingPersonName && onBackToGroup ? onBackToGroup : onBack}
            className="bg-black/60 text-white hover:bg-black/80 rounded-full border-none backdrop-blur-md shadow-md cursor-pointer"
          />

          <div className="flex items-center gap-2">
            {/* Community updates circular button */}
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => {
                setHasDismissedCommunityNotification(true)
                if (onOpenCommunity) {
                  onOpenCommunity(shop.id)
                } else {
                  setIsCommunityOpen(true)
                }
              }}
              className="relative bg-black/60 text-white hover:bg-black/80 rounded-full border-none backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer"
              title={lang === "ar" ? "تحديثات المجتمع" : "Community updates"}
            >
              <IconUsers size={18} stroke={2} />
              <NotificationDot
                visible={showCommunityNotification}
                color="rose"
                size="sm"
                placement="top-right"
              />
            </Button>

            {/* Favorite button */}
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={onToggleFavorite}
              className="bg-black/60 text-white hover:bg-black/80 rounded-full border-none backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer"
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
                size={18}
                stroke={2}
                className={
                  isFavorite ? "text-rose-500 fill-rose-500" : "text-white"
                }
              />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 left-4" dir={dir}>
          <div className="flex items-end justify-between">
            <div className="text-start">
              <div className="flex items-center gap-1.5">
                <h2
                  className="text-xl font-light text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {lang === "ar" ? shop.nameAr : shop.name}
                </h2>
                {shop.isVerified && (
                  <IconCheck
                    size={15}
                    stroke={3}
                    className="text-[var(--primary)] shrink-0"
                  />
                )}
              </div>
              <p className="text-xs text-white/75">{shop.address}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Rating
                value={shop.rating}
                size={13}
                textClassName="text-white font-bold"
              />
              <span className="text-xs text-white/80">
                ({shop.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Single clean line: Shop Status on one side, Working Hours on the other */}
      <div
        className="px-5 py-3 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between"
        dir={dir}
      >
        {/* Status badge and Community time if active (in place of where clock was) */}
        <div className="flex items-center gap-2">
          <StatusChip isOpen={currentIsOpen} lang={lang} />

          {/* Community status badge with time (HH:MM) - disappears next day */}
          {isCommunityActiveToday && (
            <Badge
              variant="subtle"
              size="sm"
              className="gap-1 text-[11px] font-semibold text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary)]/10"
            >
              <IconUsers size={12} />
              <span>{T.communityUpdateWithTime(communityTimeFormatted)}</span>
            </Badge>
          )}
        </div>

        {/* Working Hours (on the other side of the same line) */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <IconClock
            size={15}
            stroke={2}
            className="text-[var(--primary)] shrink-0"
          />
          <span className="text-xs font-bold text-[var(--foreground)]">
            {shop.workingHours ? shop.workingHours[lang] : "10:00ص - 12:00م"}
          </span>
        </div>
      </div>

      {/* Tabs navigation using unified Tabs component */}
      <div className="px-5 pt-3" dir={dir}>
        <Tabs
          value={tab}
          onValueChange={(newTab) => {
            setTab(newTab)
            if (newTab === "staff") {
              setHasDismissedStaffNotification(true)
            }
          }}
          dir={dir}
        >
          <TabsList className="w-full grid grid-cols-4" dir={dir}>
            <TabsTrigger value="services">{T.services}</TabsTrigger>
            <TabsTrigger
              value="staff"
              className="relative"
              onClick={() => {
                setTab("staff")
                setHasDismissedStaffNotification(true)
              }}
            >
              <NotificationDot
                visible={showStaffNotification}
                color="rose"
                size="xs"
                placement="top-end"
                className="-top-0.5 -end-1.5"
              >
                <span>{T.staff}</span>
              </NotificationDot>
            </TabsTrigger>
            <TabsTrigger value="gallery">
              {lang === "ar" ? "الصور" : "Gallery"}
            </TabsTrigger>
            <TabsTrigger value="reviews">{T.reviews}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {tab === "services" && (
          <div className="px-5 py-4 space-y-2.5" dir={dir}>
            <p className="text-xs tracking-widest uppercase mb-3 text-[var(--muted-foreground)]">
              {T.chooseService}
            </p>
            {shop.services.map((sv) => {
              const isSelected = selectedService === sv.id
              return (
                <Card
                  key={sv.id}
                  interactive
                  onClick={() => setSelectedService(isSelected ? null : sv.id)}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  {/* Service info: Title & Time with Clock icon */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--primary)] text-black shadow-xs shrink-0">
                        <IconCheck size={11} stroke={3.5} />
                      </span>
                    )}
                    <div className="flex-1 min-w-0 text-start">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {lang === "ar" ? sv.name : sv.nameEn}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--muted-foreground)]">
                        <IconClock
                          size={12}
                          stroke={2}
                          className="text-[var(--primary)] shrink-0"
                        />
                        <span>
                          {sv.duration} {T.mins}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-end">
                    <span className="text-sm font-bold text-[var(--primary)] tabular-nums">
                      {sv.price} {lang === "ar" ? "د.ل" : "LYD"}
                    </span>
                  </div>
                </Card>
              )
            })}

            {shop.addons.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs tracking-widest uppercase text-[var(--muted-foreground)]">
                    {T.addons}
                  </p>
                  {selectedAddons.length > 0 && (
                    <span className="text-[11px] font-semibold text-[var(--primary)]">
                      {lang === "ar"
                        ? `${selectedAddons.length} محددة`
                        : `${selectedAddons.length} selected`}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
                  {shop.addons.map((a) => {
                    const isSelected = selectedAddons.includes(a.id)
                    return (
                      <div
                        key={a.id}
                        onClick={() => toggleAddon(a.id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors select-none ${
                          isSelected
                            ? "bg-[var(--primary)]/10"
                            : "hover:bg-[var(--muted)]/40"
                        }`}
                      >
                        {/* Name and Checkbox */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[var(--primary)] text-black shadow-xs"
                                : "border border-[var(--border)] bg-[var(--background)]"
                            }`}
                          >
                            {isSelected && <IconCheck size={11} stroke={3.5} />}
                          </div>
                          <span
                            className={`text-xs ${
                              isSelected
                                ? "font-semibold text-[var(--foreground)]"
                                : "text-[var(--foreground)]/85"
                            }`}
                          >
                            {a.name}
                          </span>
                        </div>

                        {/* Price */}
                        <span
                          className={`text-xs font-semibold ${
                            isSelected
                              ? "text-[var(--primary)]"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          +{a.price} {lang === "ar" ? "د.ل" : "LYD"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "staff" && (
          <div className="px-5 py-4 space-y-3" dir={dir}>
            <p className="text-xs tracking-widest uppercase mb-1 text-[var(--muted-foreground)]">
              {T.currentStaff}
            </p>
            {shop.staff.map((st) => {
              const isInactive = st.isActive === false
              const secs = altSecsMap[st.id] ?? 0
              const claimed = altClaimed[st.id]
              const hasAlt =
                !isInactive && !!st.altBooking && !claimed && secs > 0
              const mins = Math.floor(secs / 60)
              const secsRem = secs % 60

              return (
                <Card
                  key={st.id}
                  className={`rounded-2xl overflow-hidden p-0 border-[var(--border)] transition-all ${
                    isInactive
                      ? "bg-[var(--card)]/60 opacity-80 border-dashed"
                      : hasAlt
                        ? "border-red-500/50"
                        : ""
                  }`}
                >
                  {/* Alt booking banner */}
                  {hasAlt && (
                    <div className="px-4 pt-3 pb-0" dir={dir}>
                      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 gap-2">
                        {/* Right side in Arabic: Text */}
                        <div
                          style={{
                            textAlign: dir === "rtl" ? "right" : "left",
                          }}
                          className="min-w-0 flex-1"
                        >
                          <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                            <IconBolt
                              size={14}
                              stroke={2.5}
                              className="shrink-0"
                            />
                            <span>
                              {lang === "ar"
                                ? "دور بديل متاح"
                                : "Slot available"}
                            </span>
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                            {lang === "ar"
                              ? "الزبون لم يؤكد حضوره"
                              : "Customer didn't confirm"}
                          </p>
                        </div>

                        {/* Left side in Arabic: Button without countdown timer */}
                        <div className="shrink-0">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setClaimedSlotBooking({
                                staffId: st.id,
                                fee: st.altBooking?.fee ?? 5,
                                serviceId: shop.services[0]?.id,
                                addonIds: [],
                              })
                              setIsClaimedServiceSheetOpen(true)
                            }}
                            className="h-8 px-3.5 text-xs font-bold rounded-full shadow-xs cursor-pointer active:scale-95 transition-transform"
                          >
                            {lang === "ar"
                              ? `خذ الدور — ${st.altBooking?.fee ?? 5} د.ل`
                              : `Claim — ${st.altBooking?.fee ?? 5} LYD`}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Claimed confirmation */}
                  {claimed && (
                    <div className="px-4 pt-3 pb-0" dir={dir}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                        <IconCheck
                          size={16}
                          stroke={2.5}
                          className="text-emerald-500"
                        />
                        <p className="text-xs font-medium text-emerald-500">
                          {lang === "ar"
                            ? `تم الحجز — خُصم ${st.altBooking!.fee} د.ل`
                            : `Booked — ${st.altBooking!.fee} LYD deducted`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    className="flex items-center gap-4 px-4 py-3.5"
                    dir={dir}
                  >
                    {/* Barber Avatar (on right in Arabic / RTL) */}
                    <div className="relative shrink-0">
                      <Avatar
                        size="lg"
                        className={
                          isInactive ? "opacity-75 grayscale-[35%]" : ""
                        }
                      >
                        <AvatarImage src={st.photo} alt={st.name} />
                      </Avatar>
                      {isInactive && (
                        <span
                          className={`absolute -bottom-0.5 ${
                            dir === "rtl" ? "-left-0.5" : "-right-0.5"
                          } w-3.5 h-3.5 rounded-full bg-zinc-400 border-2 border-[var(--card)]`}
                          title={T.inactiveBarber}
                        />
                      )}
                    </div>

                    {/* Barber Details (on left of avatar in Arabic / RTL) */}
                    <div className="flex-1 min-w-0 text-start">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold leading-snug break-words ${
                            isInactive
                              ? "text-[var(--muted-foreground)]"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {st.name}
                        </p>
                        {isInactive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-500 border border-zinc-500/25 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span>{T.inactiveBarber}</span>
                          </span>
                        )}
                      </div>

                      {isInactive ? (
                        <div className="flex items-center gap-2.5 mt-1 text-xs text-[var(--muted-foreground)]">
                          <Rating
                            value={st.rating}
                            size={12}
                            textClassName="font-bold opacity-75"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)] flex-wrap">
                          <Rating
                            value={st.rating}
                            size={12}
                            textClassName="font-bold"
                          />
                          <span>
                            {st.queue} {T.waiting2}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconClock size={12} stroke={2} />
                            <span>
                              ~{st.avgWait} {T.mins}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {tab === "gallery" && (
          <div className="px-5 py-4" dir={dir}>
            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3">
              {galleryItems.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setLightboxImage({ url: item.url, title: item.title })
                  }
                  className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer border border-[var(--border)] bg-[var(--card)] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img
                    src={item.url}
                    alt={item.title || "Gallery photo"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.title && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 inset-x-2.5 text-white">
                        <p className="text-xs font-medium line-clamp-2 leading-snug text-white/95">
                          {item.title}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="px-5 py-4 space-y-4" dir={dir}>
            {/* Review Cards List */}
            <div className="space-y-3">
              {reviewsList.map((r: any) => (
                <Card
                  key={r.id}
                  className="p-4 rounded-2xl border-[var(--border)] bg-[var(--card)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                        {r.name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {r.name}
                        </span>
                        {r.serviceUsed && (
                          <p className="text-[10px] text-[var(--muted-foreground)]">
                            {lang === "ar" ? "الخدمة: " : "Service: "}{" "}
                            {r.serviceUsed}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Rating value={r.rating} variant="stars" size={11} />
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        {r.time}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-[var(--foreground)]/90">
                    {r.text}
                  </p>

                  {/* Customer Attached Photos */}
                  {r.photos && r.photos.length > 0 && (
                    <div className="pt-1">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {r.photos.map((photoUrl: string, pIdx: number) => (
                          <div
                            key={pIdx}
                            onClick={() =>
                              setLightboxImage({
                                url: photoUrl,
                                title: `${
                                  lang === "ar" ? "صورة من تقييم" : "Photo by"
                                } ${r.name}`,
                              })
                            }
                            className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-[var(--border)] group"
                          >
                            <img
                              src={photoUrl}
                              alt="Review attachment"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Action using unified Button */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 py-4"
        style={{
          background: `linear-gradient(to top, ${C.bg} 70%, transparent)`,
        }}
      >
        <Button
          size="lg"
          fullWidth
          disabled={!selectedService}
          onClick={() =>
            selectedService &&
            onBook(
              shopId,
              selectedService,
              selectedAddons,
              hasActiveDraft ? savedDraft?.step || "group_list" : "barber",
            )
          }
        >
          {selectedService ? (
            <span className="flex items-center justify-between w-full px-1">
              <span>{hasActiveDraft ? T.continueBooking : T.bookNow}</span>
              <span className="text-sm font-bold opacity-90">
                {totalPrice} {lang === "ar" ? "د.ل" : "LYD"}
              </span>
            </span>
          ) : (
            T.chooseFirst
          )}
        </Button>
      </div>

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

      {/* Community Updates Page (fallback if not routed via screen navigation) */}
      {!onOpenCommunity && (
        <CommunityUpdates
          open={isCommunityOpen}
          onClose={() => setIsCommunityOpen(false)}
          lang={lang}
          shopId={shop.id}
          shopName={shop.name}
          shopNameAr={shop.nameAr}
          isVerified={shop.isVerified}
          communityData={communityData}
          onUpdateCommunityData={handleUpdateCommunityData}
          onToggleSimulateDate={() => setIsSimulatedYesterday((prev) => !prev)}
          isSimulatedYesterday={isSimulatedYesterday}
        />
      )}

      {/* Service & Add-ons Selection Bottom Sheet for Claimed Slot */}
      {claimedSlotBooking && (
        <ServiceSelectionBottomSheet
          open={isClaimedServiceSheetOpen}
          onClose={() => setIsClaimedServiceSheetOpen(false)}
          title={
            lang === "ar"
              ? "تحديد الخدمة والإضافات"
              : "Select Service & Add-ons"
          }
          confirmText={
            lang === "ar" ? "تأكيد ومتابعة للفاتورة" : "Confirm & View Invoice"
          }
          totalLabel={lang === "ar" ? "الإجمالي:" : "Total:"}
          showNameInput={false}
          onConfirm={({ serviceId, addonIds }) => {
            setIsClaimedServiceSheetOpen(false)
            if (onClaimSlot && claimedSlotBooking) {
              onClaimSlot(
                shopId,
                claimedSlotBooking.staffId,
                claimedSlotBooking.fee,
                serviceId,
                addonIds,
              )
            }
          }}
          services={shop.services}
          addons={shop.addons}
          initialServiceId={
            claimedSlotBooking.serviceId || shop.services[0]?.id
          }
          initialAddonIds={claimedSlotBooking.addonIds || []}
          initialStaffId={claimedSlotBooking.staffId}
          lang={lang}
          dir={dir}
        />
      )}
    </div>
  )
}
