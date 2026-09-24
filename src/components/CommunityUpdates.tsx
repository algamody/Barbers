import { useState, useEffect } from "react"
import { Badge, Button, Card, StatusChip, BackButton } from "@/components/ui"
import {
  IconX,
  IconClock,
  IconDoor,
  IconDoorExit,
  IconPlus,
  IconThumbUp,
  IconUsers,
} from "@tabler/icons-react"
import { Lang, useT } from "../i18n"
import {
  SHOPS,
  CommunityUpdateData,
  CommunityReport,
  formatTimeHM,
} from "../data"
import { CommunityUpdateBottomSheet } from "@/components/bottom-sheets"

export interface CommunityUpdatesProps {
  shopId?: string
  shopName?: string
  shopNameAr?: string
  isVerified?: boolean
  lang?: Lang
  theme?: string
  communityData?: CommunityUpdateData | null
  onUpdateCommunityData?: (updated: CommunityUpdateData) => void
  onBack?: () => void
  open?: boolean
  onClose?: () => void
  onToggleSimulateDate?: () => void
  isSimulatedYesterday?: boolean
}

export default function CommunityUpdates({
  shopId,
  shopName,
  shopNameAr,
  isVerified = false,
  lang = "ar",
  communityData,
  onUpdateCommunityData,
  onBack,
  open,
  onClose,
  onToggleSimulateDate,
  isSimulatedYesterday = false,
}: CommunityUpdatesProps) {
  const dir = lang === "ar" ? "rtl" : "ltr"
  const T = useT(lang)

  const foundShop = shopId ? SHOPS.find((s) => s.id === shopId) : null
  const resolvedShopName = shopName || foundShop?.name || "صالون الحلاقة"
  const resolvedShopNameAr = shopNameAr || foundShop?.nameAr || resolvedShopName

  const [data, setData] = useState<CommunityUpdateData>(() => {
    if (communityData) return communityData
    if (shopId) {
      try {
        const saved = localStorage.getItem(`community_data_${shopId}`)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return (
      (foundShop as any)?.communityUpdate || {
        updatedAt: new Date().toISOString(),
        isOpen: true,
        waitingCount: 4,
        openCount: 14,
        closedCount: 2,
        reports: [],
      }
    )
  })

  useEffect(() => {
    if (communityData) {
      setData(communityData)
    }
  }, [communityData])

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [selectedPhotoPreview, setSelectedPhotoPreview] =
    useState<string | null>(null)
  const [likedReports, setLikedReports] = useState<Record<string, boolean>>({})

  if (open !== undefined && !open) return null

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (onClose) {
      onClose()
    }
  }

  const effectiveUpdatedAt = isSimulatedYesterday
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : data.updatedAt

  const timeFormatted = formatTimeHM(effectiveUpdatedAt, lang)

  const totalUpdates = data.openCount + data.closedCount
  const totalVotes = totalUpdates || 1
  const openPercentage = Math.round((data.openCount / totalVotes) * 100)
  const closedPercentage = 100 - openPercentage

  const handleLikeReport = (id: string) => {
    setLikedReports((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleNewUpdateSubmitted = (newInput: {
    isOpen: boolean
    waitingCount: number
    note: string
    photo?: string
  }) => {
    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      userName: lang === "ar" ? "أنت (مساهم مجتمعي)" : "You (Community Member)",
      userAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format",
      isOpen: newInput.isOpen,
      waitingCount: newInput.waitingCount,
      time: new Date().toISOString(),
      note: newInput.note,
      photo: newInput.photo,
      confirmedCount: 1,
    }

    const updated: CommunityUpdateData = {
      updatedAt: new Date().toISOString(),
      isOpen: newInput.isOpen,
      waitingCount: newInput.waitingCount,
      openCount: newInput.isOpen ? data.openCount + 1 : data.openCount,
      closedCount: !newInput.isOpen ? data.closedCount + 1 : data.closedCount,
      reports: [newReport, ...(data.reports || [])],
    }

    setData(updated)
    if (shopId) {
      try {
        localStorage.setItem(
          `community_data_${shopId}`,
          JSON.stringify(updated),
        )
      } catch {}
    }
    if (onUpdateCommunityData) {
      onUpdateCommunityData(updated)
    }
  }

  return (
    <div
      dir={dir}
      className={`flex flex-col h-full bg-[var(--background)] overflow-hidden relative ${
        open !== undefined ? "absolute inset-0 z-40" : ""
      }`}
    >
      {/* Top Header - Symmetrically Centered Navigation Bar */}
      <div className="pt-12 pb-3 px-4 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md shrink-0 relative flex items-center justify-center min-h-[82px] shadow-xs">
        {/* Back button positioned absolutely on start edge */}
        <BackButton
          dir={dir}
          onClick={handleBack}
          className="absolute start-4 bottom-3 w-10 h-10 border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)]/50 z-20"
          iconSize={20}
          iconStroke={2.2}
        />

        {/* Title & subtitle: strictly mathematically centered */}
        <div className="flex flex-col items-center justify-center text-center max-w-[calc(100%-100px)] z-10 pointer-events-none">
          <h1 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center justify-center gap-1.5 leading-snug">
            <IconUsers size={18} className="text-[var(--primary)] shrink-0" />
            <span>{T.communityUpdatesTitle}</span>
          </h1>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-tight mt-0.5 truncate">
            {lang === "ar" ? resolvedShopNameAr : resolvedShopName}
          </p>
        </div>
      </div>

      {/* Scrollable Page Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-10">
        {/* Status & Timing Overview Card */}
        <Card className="p-5 rounded-3xl border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          {/* Big Count in Center & Smaller Last Update Time */}
          <div className="text-center space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
              {totalUpdates}
            </div>
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">
              {lang === "ar" ? "تحديث مجتمعي" : "Community updates"}
            </div>

            {/* Smaller Last Update Time Underneath */}
            <div className="inline-flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)] pt-1">
              <IconClock size={13} className="text-[var(--primary)] shrink-0" />
              <span>
                {lang === "ar" ? "آخر تحديث:" : "Last update:"}{" "}
                <strong className="text-[var(--foreground)] font-semibold">
                  {timeFormatted}
                </strong>
              </span>
            </div>
          </div>

          {/* Underneath: Updates Bar (شريط التحديثات) */}
          <div className="space-y-2 pt-3 border-t border-[var(--border)]/60">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <IconDoor size={16} />
                <span>
                  {data.openCount} {T.openVotes}
                </span>
              </span>
              <span className="text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <IconDoorExit size={16} />
                <span>
                  {data.closedCount} {T.closedVotes}
                </span>
              </span>
            </div>

            {/* Visual Split Progress Bar (شريط التحديثات) */}
            <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-700/80 overflow-hidden flex p-0.5 gap-0.5">
              <div
                style={{ width: `${openPercentage}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                title={`${openPercentage}% ${T.openVotes}`}
              />
              <div
                style={{ width: `${closedPercentage}%` }}
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                title={`${closedPercentage}% ${T.closedVotes}`}
              />
            </div>
          </div>
        </Card>

        {/* Action Button: Add Status Update (Opens Bottom Sheet) */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => setIsBottomSheetOpen(true)}
          className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 rounded-2xl font-bold py-3.5 shadow-md gap-2 cursor-pointer flex items-center justify-center text-sm active:scale-98 transition-transform"
        >
          <IconPlus size={20} stroke={2.5} />
          <span>{T.addCommunityUpdate}</span>
        </Button>

        {/* Feed of updates displayed like reviews */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {T.recentCommunityReports}
            </h3>
          </div>

          {data.reports && data.reports.length > 0 ? (
            <div className="space-y-3">
              {data.reports.map((report) => {
                const repTimeFormatted = formatTimeHM(report.time, lang)
                const isLiked = likedReports[report.id]
                const currentLikes =
                  (report.confirmedCount || 0) + (isLiked ? 1 : 0)

                return (
                  <Card
                    key={report.id}
                    className="p-4 rounded-2xl border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80 transition-all space-y-3 shadow-2xs"
                  >
                    {/* User & Status Header (Review Style) */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {report.userAvatar ? (
                          <img
                            src={report.userAvatar}
                            alt={report.userName}
                            className="w-9 h-9 rounded-full object-cover border border-[var(--border)]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-bold text-[var(--foreground)] border border-[var(--border)]">
                            {report.userName.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[var(--foreground)]">
                              {report.userName}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                            <IconClock size={11} />
                            {repTimeFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {report.isOpen ? (
                        <div className="flex flex-col items-center shrink-0">
                          <StatusChip isOpen={true} lang={lang} />
                          {report.waitingCount !== undefined &&
                            report.waitingCount !== null && (
                              <span className="text-[11px] font-semibold text-[var(--muted-foreground)] mt-0.5">
                                {lang === "ar"
                                  ? `العدد: ${report.waitingCount}`
                                  : `Count: ${report.waitingCount}`}
                              </span>
                            )}
                        </div>
                      ) : (
                        <StatusChip
                          isOpen={false}
                          lang={lang}
                          className="shrink-0"
                        />
                      )}
                    </div>

                    {/* Report Text Note (Review Content) */}
                    {report.note && (
                      <p className="text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90 bg-[var(--muted)]/20 p-3 rounded-2xl border border-[var(--border)]/40">
                        {report.note}
                      </p>
                    )}

                    {/* Attached Proof Photo */}
                    {report.photo && (
                      <div
                        onClick={() =>
                          setSelectedPhotoPreview(report.photo || null)
                        }
                        className="relative h-36 rounded-2xl overflow-hidden border border-[var(--border)] cursor-pointer group bg-black/30"
                      >
                        <img
                          src={report.photo}
                          alt="Proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {lang === "ar" ? "تكبير الصورة" : "Enlarge photo"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer / helpful reaction */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/40 text-xs">
                      <button
                        type="button"
                        onClick={() => handleLikeReport(report.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isLiked
                            ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]"
                            : "border-[var(--border)] bg-[var(--muted)]/20 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <IconThumbUp size={14} stroke={isLiked ? 2.5 : 2} />
                        <span>{currentLikes}</span>
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[var(--muted-foreground)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
              {T.noCommunityUpdatesYet}
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Photo Lightbox Modal */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div className="relative max-w-lg w-full max-h-[85vh] rounded-2xl overflow-hidden border border-white/20">
            <button
              type="button"
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-black"
            >
              <IconX size={18} />
            </button>
            <img
              src={selectedPhotoPreview}
              alt="Enlarged Proof"
              className="w-full h-full object-contain bg-black"
            />
          </div>
        </div>
      )}

      {/* Community Update Personal Input Bottom Sheet */}
      <CommunityUpdateBottomSheet
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        lang={lang}
        shopName={lang === "ar" ? resolvedShopNameAr : resolvedShopName}
        onSubmitSuccess={handleNewUpdateSubmitted}
      />
    </div>
  )
}
