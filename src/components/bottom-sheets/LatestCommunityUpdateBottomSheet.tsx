import { useState } from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui"
import {
  IconUsers,
  IconX,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react"
import { Lang, useT } from "@/i18n"
import { CommunityReport } from "@/data"
import CommunityUpdateCard, { VoteType } from "@/components/CommunityUpdateCard"

export interface LatestCommunityUpdateBottomSheetProps {
  open: boolean
  onClose: () => void
  report: CommunityReport | null
  shopName: string
  shopNameAr?: string
  lang?: Lang
  userVote?: VoteType | null
  onVote?: (reportId: string, vote: VoteType) => void
  onViewAllUpdates?: () => void
}

export function LatestCommunityUpdateBottomSheet({
  open,
  onClose,
  report,
  shopName,
  shopNameAr,
  lang = "ar",
  userVote,
  onVote,
  onViewAllUpdates,
}: LatestCommunityUpdateBottomSheetProps) {
  const dir = lang === "ar" ? "rtl" : "ltr"
  const T = useT(lang)
  const [selectedPhotoPreview, setSelectedPhotoPreview] =
    useState<string | null>(null)

  const resolvedName = lang === "ar" ? shopNameAr || shopName : shopName

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        dir={dir}
        className="max-w-md mx-auto"
      >
        <div className="space-y-4">
          {/* Top Custom Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <IconUsers size={20} stroke={2} />
              </div>
              <div className="text-start">
                <h3 className="text-base font-bold text-[var(--foreground)] leading-tight flex items-center gap-1.5">
                  <span>{T.latestCommunityUpdate}</span>
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-tight mt-0.5">
                  {resolvedName}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Only the latest community report */}
          {report ? (
            <CommunityUpdateCard
              report={report}
              lang={lang}
              isLatest={true}
              userVote={userVote}
              onVote={onVote}
              onImageClick={(url) => setSelectedPhotoPreview(url)}
              showLatestBadge={false}
              className="border-[var(--primary)]/30 shadow-sm"
            />
          ) : (
            <div className="py-8 text-center text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)]">
              {T.noCommunityUpdatesYet}
            </div>
          )}

          {/* View All Community Updates Button - Styled like signature app buttons */}
          {onViewAllUpdates && (
            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => {
                  onClose()
                  onViewAllUpdates()
                }}
                className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold py-3.5 rounded-2xl shadow-md cursor-pointer active:scale-98 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>{T.viewAllUpdates}</span>
                {dir === "rtl" ? (
                  <IconArrowLeft size={18} stroke={2.5} />
                ) : (
                  <IconArrowRight size={18} stroke={2.5} />
                )}
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>

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
    </>
  )
}
export default LatestCommunityUpdateBottomSheet
