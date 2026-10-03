import { useState } from "react"
import { Card, StatusChip, Badge, AlertDialog } from "@/components/ui"
import {
  IconClock,
  IconCheck,
  IconX,
  IconHelpCircle,
  IconLock,
} from "@tabler/icons-react"
import { Lang, useT } from "@/i18n"
import { CommunityReport, formatTimeHM } from "@/data"
import { cn } from "@/lib/utils"

export type VoteType = "correct" | "incorrect" | "unsure"

export interface CommunityUpdateCardProps {
  report: CommunityReport
  lang?: Lang
  isLatest?: boolean
  userVote?: VoteType | null
  onVote?: (reportId: string, vote: VoteType) => void
  onImageClick?: (imageUrl: string) => void
  className?: string
  showLatestBadge?: boolean
}

/**
 * CommunityUpdateCard (بطاقة تحديث مجتمعي)
 * Unified card component for displaying a community update.
 * In latest mode: offers choices (نعم, لا, لا أعرف).
 * Clicking "نعم" or "لا" prompts an "Are you sure?" confirmation modal.
 * Once confirmed, the choice is locked permanently and cannot be changed.
 * In older/standard mode: displays counts (نعم, لا) as read-only tags.
 */
export default function CommunityUpdateCard({
  report,
  lang = "ar",
  isLatest = false,
  userVote,
  onVote,
  onImageClick,
  className,
  showLatestBadge = true,
}: CommunityUpdateCardProps) {
  const T = useT(lang)
  const repTimeFormatted = formatTimeHM(report.time, lang)

  const confirmedCount = report.confirmedCount || 0
  const unconfirmedCount = report.unconfirmedCount || 0

  const [modalVoteType, setModalVoteType] = useState<"correct" | "incorrect">(
    "correct",
  )
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)

  // Once user has confirmed a vote, choice cannot be changed
  const isVoted = Boolean(userVote)

  const handleVoteClick = (vote: VoteType) => {
    if (isVoted) return // Locked: cannot change choice

    if (vote === "correct" || vote === "incorrect") {
      setModalVoteType(vote)
      setShowConfirmModal(true)
    } else {
      onVote?.(report.id, "unsure")
    }
  }

  const handleConfirmVote = () => {
    onVote?.(report.id, modalVoteType)
    setShowConfirmModal(false)
  }

  const handleCancelVote = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <Card
        className={cn(
        "p-4 rounded-2xl transition-all space-y-3 shadow-2xs",
        isLatest
          ? "border-[var(--primary)]/40 bg-[var(--card)] shadow-xs ring-1 ring-[var(--primary)]/15"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80",
        className,
      )}
    >
      {/* Optional Top Badge for Latest Update */}
      {isLatest && showLatestBadge && (
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]/40">
          <Badge
            variant="subtle"
            size="xs"
            className="gap-1.5 text-[11px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/25"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span>{T.latestCommunityUpdate}</span>
          </Badge>
          <span className="text-[10px] text-[var(--muted-foreground)] font-medium">
            {lang === "ar" ? "الأحدث الآن" : "Most Recent"}
          </span>
        </div>
      )}

      {/* User & Status Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {report.userAvatar ? (
            <img
              src={report.userAvatar}
              alt={report.userName}
              className="w-9 h-9 rounded-full object-cover border border-[var(--border)] shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-bold text-[var(--foreground)] border border-[var(--border)] shrink-0">
              {report.userName.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[var(--foreground)] truncate">
                {report.userName}
              </span>
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
              <IconClock size={11} className="shrink-0" />
              <span>{repTimeFormatted}</span>
            </span>
          </div>
        </div>

        {/* Status Tag */}
        {report.isOpen ? (
          <div className="flex flex-col items-end shrink-0">
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
          <StatusChip isOpen={false} lang={lang} className="shrink-0" />
        )}
      </div>

      {/* Report Text Note */}
      {report.note && (
        <p className="text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90 bg-[var(--muted)]/25 p-3 rounded-2xl border border-[var(--border)]/40">
          {report.note}
        </p>
      )}

      {/* Attached Proof Photo */}
      {report.photo && (
        <div
          onClick={() => onImageClick?.(report.photo || "")}
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

      {/* Action / Feedback Section */}
      <div className="pt-2 border-t border-[var(--border)]/40">
        {isLatest ? (
          /* Latest Card Actions: 3 buttons (نعم, لا, لا أعرف) */
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-[var(--muted-foreground)] px-0.5 flex items-center justify-between">
              <span>{T.rateThisUpdate}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: نعم (Green) */}
              <button
                type="button"
                disabled={isVoted}
                onClick={() => handleVoteClick("correct")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all select-none",
                  isVoted
                    ? userVote === "correct"
                      ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs cursor-default ring-2 ring-emerald-500/40"
                      : "opacity-35 cursor-not-allowed border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 pointer-events-none"
                    : userVote === "correct"
                      ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-sm ring-2 ring-emerald-500/40 cursor-pointer active:scale-95"
                      : "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 cursor-pointer active:scale-95",
                )}
                title={
                  isVoted
                    ? userVote === "correct"
                      ? lang === "ar"
                        ? "تم تأكيد اختيارك (نعم)"
                        : "Confirmed (Yes)"
                      : lang === "ar"
                        ? "لا يمكن تغيير الخيار"
                        : "Option locked"
                    : lang === "ar"
                      ? "تأكيد صحة التحديث"
                      : "Confirm update"
                }
              >
                <IconCheck
                  size={15}
                  stroke={userVote === "correct" ? 3 : 2.5}
                  className={
                    userVote === "correct"
                      ? "text-white"
                      : isVoted
                        ? "text-zinc-400 dark:text-zinc-600"
                        : "text-emerald-600 dark:text-emerald-400"
                  }
                />
                <span className="truncate">{T.correctVote}</span>
                {confirmedCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      userVote === "correct"
                        ? "bg-white/25 text-white"
                        : isVoted
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                          : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
                    )}
                  >
                    {confirmedCount}
                  </span>
                )}
              </button>

              {/* Option 2: لا (Red) */}
              <button
                type="button"
                disabled={isVoted}
                onClick={() => handleVoteClick("incorrect")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all select-none",
                  isVoted
                    ? userVote === "incorrect"
                      ? "border-red-600 bg-red-600 text-white font-bold shadow-xs cursor-default ring-2 ring-red-500/40"
                      : "opacity-35 cursor-not-allowed border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 pointer-events-none"
                    : userVote === "incorrect"
                      ? "border-red-600 bg-red-600 text-white font-bold shadow-sm ring-2 ring-red-500/40 cursor-pointer active:scale-95"
                      : "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25 cursor-pointer active:scale-95",
                )}
                title={
                  isVoted
                    ? userVote === "incorrect"
                      ? lang === "ar"
                        ? "تم تأكيد اختيارك (لا)"
                        : "Confirmed (No)"
                      : lang === "ar"
                        ? "لا يمكن تغيير الخيار"
                        : "Option locked"
                    : lang === "ar"
                      ? "نفي صحة التحديث"
                      : "Report inaccurate"
                }
              >
                <IconX
                  size={15}
                  stroke={userVote === "incorrect" ? 3 : 2.5}
                  className={
                    userVote === "incorrect"
                      ? "text-white"
                      : isVoted
                        ? "text-zinc-400 dark:text-zinc-600"
                        : "text-red-600 dark:text-red-400"
                  }
                />
                <span className="truncate">{T.incorrectVote}</span>
                {unconfirmedCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      userVote === "incorrect"
                        ? "bg-white/25 text-white"
                        : isVoted
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                          : "bg-red-500/20 text-red-800 dark:text-red-200",
                    )}
                  >
                    {unconfirmedCount}
                  </span>
                )}
              </button>

              {/* Option 3: لا أعرف */}
              <button
                type="button"
                disabled={isVoted}
                onClick={() => handleVoteClick("unsure")}
                className={cn(
                  "flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all select-none",
                  isVoted
                    ? userVote === "unsure"
                      ? "border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-xs font-bold cursor-default"
                      : "opacity-35 cursor-not-allowed border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 pointer-events-none"
                    : userVote === "unsure"
                      ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs ring-1 ring-amber-500/30 font-bold cursor-pointer active:scale-95"
                      : "border-[var(--border)] bg-[var(--muted)]/20 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)] cursor-pointer active:scale-95",
                )}
                title={
                  isVoted
                    ? userVote === "unsure"
                      ? lang === "ar"
                        ? "تم تسجيل اختيارك (لا أعرف)"
                        : "Confirmed (Unsure)"
                      : lang === "ar"
                        ? "لا يمكن تغيير الخيار"
                        : "Option locked"
                    : lang === "ar"
                      ? "لا أعرف"
                      : "Don't know"
                }
              >
                <IconHelpCircle
                  size={14}
                  stroke={userVote === "unsure" ? 2.5 : 2}
                  className={
                    userVote === "unsure"
                      ? "text-amber-600 dark:text-amber-400"
                      : isVoted
                        ? "text-zinc-400 dark:text-zinc-600"
                        : "text-[var(--muted-foreground)]"
                  }
                />
                <span className="truncate">{T.notSureVote}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Older Cards: Display-only tags showing counts for نعم and لا (غير قابلة للنقر) */
          <div className="flex items-center gap-2">
            {/* Display Tag 1: نعم + Count (Read-only) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 select-none">
              <IconCheck
                size={14}
                stroke={2.5}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <span>{T.correctVote}</span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                {confirmedCount}
              </span>
            </div>

            {/* Display Tag 2: لا + Count (Read-only) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 select-none">
              <IconX
                size={14}
                stroke={2.5}
                className="text-red-600 dark:text-red-400"
              />
              <span>{T.incorrectVote}</span>
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-800 dark:text-red-200">
                {unconfirmedCount}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>

    {/* Confirmation Modal */}
    <AlertDialog
      open={showConfirmModal}
      onClose={handleCancelVote}
      type={modalVoteType === "correct" ? "success" : "error"}
      icon={
        modalVoteType === "correct" ? (
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <IconCheck size={32} stroke={2.5} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
            <IconX size={32} stroke={2.5} />
          </div>
        )
      }
      title={T.confirmVoteTitle}
      description={
        modalVoteType === "correct"
          ? T.confirmVoteDescCorrect
          : T.confirmVoteDescIncorrect
      }
      confirmText={T.confirmVoteAction}
      cancelText={T.cancelVoteAction}
      onConfirm={handleConfirmVote}
      onCancel={handleCancelVote}
      dir={lang === "ar" ? "rtl" : "ltr"}
    />
  </>
  )
}
export { CommunityUpdateCard }
