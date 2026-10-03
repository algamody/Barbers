import { useState, useEffect } from "react"
import {
  Badge,
  Button,
  Card,
  StatusChip,
  BackButton,
  showSnackbar,
} from "@/components/ui"
import {
  IconX,
  IconClock,
  IconDoor,
  IconDoorExit,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react"
import { Lang, useT } from "../i18n"
import {
  SHOPS,
  CommunityUpdateData,
  CommunityReport,
  formatTimeHM,
  notifyCommunitySync,
} from "../data"
import { CommunityUpdateBottomSheet } from "@/components/bottom-sheets"
import CommunityUpdateCard, { VoteType } from "./CommunityUpdateCard"

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
  const [userVotes, setUserVotes] = useState<Record<string, VoteType>>(() => {
    if (shopId) {
      try {
        const saved = localStorage.getItem(`community_user_votes_${shopId}`)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {}
  })

  useEffect(() => {
    if (!shopId) return
    const handleSync = () => {
      try {
        const savedData = localStorage.getItem(`community_data_${shopId}`)
        if (savedData) setData(JSON.parse(savedData))
        const savedVotes = localStorage.getItem(`community_user_votes_${shopId}`)
        if (savedVotes) setUserVotes(JSON.parse(savedVotes))
      } catch {}
    }
    handleSync()
    window.addEventListener("barbers_community_sync", handleSync)
    window.addEventListener("storage", handleSync)
    return () => {
      window.removeEventListener("barbers_community_sync", handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [shopId])

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

  const handleVote = (reportId: string, vote: VoteType) => {
    // Once confirmed, the user cannot change their choice
    if (userVotes[reportId]) {
      return
    }

    const nextVotes = { ...userVotes, [reportId]: vote }
    setUserVotes(nextVotes)
    if (shopId) {
      try {
        localStorage.setItem(
          `community_user_votes_${shopId}`,
          JSON.stringify(nextVotes),
        )
      } catch {}
    }

    if (data && data.reports) {
      const updatedReports = data.reports.map((rep) => {
        if (rep.id !== reportId) return rep

        let confirmed = rep.confirmedCount || 0
        let unconfirmed = rep.unconfirmedCount || 0

        if (vote === "correct") confirmed += 1
        if (vote === "incorrect") unconfirmed += 1

        return {
          ...rep,
          confirmedCount: confirmed,
          unconfirmedCount: unconfirmed,
        }
      })

      const updated: CommunityUpdateData = {
        ...data,
        reports: updatedReports,
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
      notifyCommunitySync(shopId)
    } else {
      notifyCommunitySync(shopId)
    }

    showSnackbar({
      title: T.feedbackRecorded,
      type: "success",
    })
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
    notifyCommunitySync(shopId)
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
        {/* Feed of updates */}
        <div className="space-y-4">
          {/* Header Row: Title & Compact Add Button (مثل زر إضافة شخص في الحجز الجماعي) */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              <span>{T.latestCommunityUpdate}</span>
            </h3>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsBottomSheetOpen(true)}
              className="h-8 px-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 font-bold flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <IconPlus
                size={15}
                stroke={2.2}
                className="text-[var(--primary)]"
              />
              <span>{T.addCommunityUpdate}</span>
            </Button>
          </div>

          {data.reports && data.reports.length > 0 ? (
            <>
              {/* 1. Latest Community Update Card (بشكل واضح ومميز) */}
              <CommunityUpdateCard
                report={data.reports[0]}
                lang={lang}
                isLatest={true}
                userVote={userVotes[data.reports[0].id]}
                onVote={handleVote}
                onImageClick={(url) => setSelectedPhotoPreview(url)}
                showLatestBadge={false}
                className="border-[var(--primary)]/40 shadow-xs"
              />

              {/* 2. Separator + Older Updates (إن وجدت) */}
              {data.reports.length > 1 && (
                <div className="space-y-3 pt-1">
                  {/* Clean Separator (سيبيريتور) */}
                  <div className="relative py-2.5 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border)]" />
                    </div>
                    <div className="relative px-3.5 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1.5 shadow-2xs">
                      <IconClock size={12} className="text-[var(--primary)]" />
                      <span>{T.previousCommunityUpdates}</span>
                    </div>
                  </div>

                  {/* Older Cards Feed (صحيح + عدده، غير صحيح + عدده، بدون لست متأكد) */}
                  <div className="space-y-3">
                    {data.reports.slice(1).map((report) => (
                      <CommunityUpdateCard
                        key={report.id}
                        report={report}
                        lang={lang}
                        isLatest={false}
                        userVote={userVotes[report.id]}
                        onVote={handleVote}
                        onImageClick={(url) => setSelectedPhotoPreview(url)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
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
