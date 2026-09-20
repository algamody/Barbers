import { useState, useRef, useEffect, useMemo } from "react"
import { BottomSheet } from "./ui/bottom-sheet"
import { Button, Textarea, Badge } from "@/components/ui"
import {
  IconCheck,
  IconCamera,
  IconX,
  IconDoor,
  IconDoorExit,
  IconSparkles,
  IconClock,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react"
import { Lang, useT } from "../i18n"

export interface CommunityUpdateBottomSheetProps {
  open: boolean
  onClose: () => void
  lang?: Lang
  shopName?: string
  onSubmitSuccess: (data: {
    isOpen: boolean
    waitingCount: number
    note: string
    photo?: string
  }) => void
}

/**
 * HorizontalWheelPicker
 * An iOS-style horizontal spinner wheel picker with magnetic snap,
 * center lens highlight, and perspective/scale falloff.
 */
function HorizontalWheelPicker({
  value,
  onChange,
  min = 0,
  max = 30,
  lang = "ar",
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  lang?: string
}) {
  const ITEM_WIDTH = 54
  const containerRef = useRef<HTMLDivElement>(null)
  const isInternalScrollRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const items = useMemo(() => {
    const list: number[] = []
    for (let i = min; i <= max; i++) list.push(i)
    return list
  }, [min, max])

  // Center initial value on mount immediately
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollLeft = (value - min) * ITEM_WIDTH
  }, [])

  // Sync scroll when external value changes
  useEffect(() => {
    if (isInternalScrollRef.current) return
    const container = containerRef.current
    if (!container) return
    const targetLeft = (value - min) * ITEM_WIDTH
    if (Math.abs(container.scrollLeft - targetLeft) > 2) {
      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      })
    }
  }, [value, min])

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    isInternalScrollRef.current = true
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

    const scrollLeft = container.scrollLeft
    const rawIndex = Math.round(scrollLeft / ITEM_WIDTH)
    const clampedValue = Math.max(min, Math.min(max, min + rawIndex))

    if (clampedValue !== value) {
      onChange(clampedValue)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isInternalScrollRef.current = false
    }, 120)
  }

  const handleItemClick = (num: number) => {
    onChange(num)
    const container = containerRef.current
    if (!container) return
    container.scrollTo({
      left: (num - min) * ITEM_WIDTH,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative w-full select-none">
      {/* Center Selection Lens (iOS Clock Style Highlight Capsule) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-12 rounded-2xl bg-[var(--primary)]/15 border-2 border-[var(--primary)]/50 pointer-events-none shadow-xs z-10" />

      {/* Left and Right Fade Gradients (for realistic circular perspective roll) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--card)] via-[var(--card)]/85 to-transparent z-20 rounded-l-2xl" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--card)] via-[var(--card)]/85 to-transparent z-20 rounded-r-2xl" />

      {/* Horizontal Scroll Wheel Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        dir="ltr"
        className="flex items-center overflow-x-auto snap-x snap-mandatory py-2.5 h-16 no-scrollbar border border-[var(--border)] rounded-2xl bg-[var(--muted)]/20 cursor-grab active:cursor-grabbing"
        style={{
          paddingLeft: "calc(50% - 27px)",
          paddingRight: "calc(50% - 27px)",
          scrollbarWidth: "none",
        }}
      >
        {items.map((num) => {
          const diff = Math.abs(num - value)

          let textStyle = "text-xs font-normal text-[var(--muted-foreground)]/30 scale-75"
          if (diff === 0) {
            textStyle = "text-2xl font-black text-[var(--primary)] scale-110"
          } else if (diff === 1) {
            textStyle = "text-lg font-bold text-[var(--foreground)]/75 scale-95"
          } else if (diff === 2) {
            textStyle = "text-sm font-medium text-[var(--muted-foreground)]/50 scale-85"
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleItemClick(num)}
              className={`w-[54px] h-12 flex-shrink-0 flex items-center justify-center snap-center transition-all duration-150 tabular-nums ${textStyle}`}
            >
              <span>{num}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CommunityUpdateBottomSheet({
  open,
  onClose,
  lang = "ar",
  shopName,
  onSubmitSuccess,
}: CommunityUpdateBottomSheetProps) {
  const dir = lang === "ar" ? "rtl" : "ltr"
  const T = useT(lang)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isOpenChoice, setIsOpenChoice] = useState<boolean>(true)
  const [waitingCount, setWaitingCount] = useState<number>(3)
  const [note, setNote] = useState<string>("")
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setAttachedPhoto(event.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmittedSuccess(true)
      onSubmitSuccess({
        isOpen: isOpenChoice,
        waitingCount: isOpenChoice ? waitingCount : 0,
        note,
        photo: attachedPhoto || undefined,
      })

      setTimeout(() => {
        setSubmittedSuccess(false)
        onClose()
        // Reset
        setNote("")
        setAttachedPhoto(null)
      }, 1000)
    }, 450)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      dir={dir}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
            <IconSparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {T.updateShopStatusTitle}
            </h3>
            {shopName && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {shopName}
              </p>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1 overflow-y-auto max-h-[72vh] px-0.5">
        {submittedSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <IconCheck size={30} stroke={3} />
            </div>
            <h4 className="text-base font-bold text-[var(--foreground)]">
              {lang === "ar" ? "شكراً لمساهمتك!" : "Thank you for contributing!"}
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              {lang === "ar"
                ? "تم تحديث حالة المحل وسيستفيد منها مجتمع الزبائن."
                : "Shop status updated and shared with the community."}
            </p>
            <Badge variant="success" size="sm" className="font-semibold gap-1">
              <IconSparkles size={13} />
              {T.communityPointsReward}
            </Badge>
          </div>
        ) : (
          <>
            {/* Reward banner */}
            <div className="rounded-xl p-2.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[var(--foreground)]">
                <IconSparkles size={16} className="text-[var(--primary)] shrink-0" />
                <span>
                  {lang === "ar"
                    ? "ساعد الزبائن واكسب نقاطاً لحسابك"
                    : "Help customers & earn reward points"}
                </span>
              </div>
              <Badge variant="default" size="xs" className="font-bold">
                +10 {lang === "ar" ? "نقاط" : "PTS"}
              </Badge>
            </div>

            {/* Status Selection (Open / Closed) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Open choice */}
                <button
                  type="button"
                  onClick={() => setIsOpenChoice(true)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    isOpenChoice
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/40"
                      : "border-[var(--border)] bg-[var(--muted)]/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isOpenChoice
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-800 text-[var(--muted-foreground)]"
                    }`}
                  >
                    <IconDoor size={20} />
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isOpenChoice
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {T.open}
                  </span>
                </button>

                {/* Closed choice */}
                <button
                  type="button"
                  onClick={() => setIsOpenChoice(false)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    !isOpenChoice
                      ? "border-red-500 bg-red-500/10 shadow-sm ring-1 ring-red-500/40"
                      : "border-[var(--border)] bg-[var(--muted)]/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      !isOpenChoice
                        ? "bg-red-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-800 text-[var(--muted-foreground)]"
                    }`}
                  >
                    <IconDoorExit size={20} />
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors ${
                      !isOpenChoice
                        ? "text-red-600 dark:text-red-400"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {T.closed}
                  </span>
                </button>
              </div>
            </div>

            {/* Waiting Count: Inputtable Horizontal iOS Wheel Spinner (Only if open) */}
            {isOpenChoice && (
              <div className="space-y-2.5 pt-1">
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                    <IconClock size={15} className="text-[var(--primary)]" />
                    <span>{T.waitingCountQuestion}</span>
                  </label>
                </div>

                {/* Horizontal iOS Clock Spinner Wheel: Minus on Left, Plus on Right */}
                <div className="flex items-center gap-2" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setWaitingCount((prev) => Math.max(0, prev - 1))}
                    disabled={waitingCount <= 0}
                    className="w-10 h-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] active:scale-95 disabled:opacity-30 cursor-pointer shrink-0 shadow-2xs transition-transform"
                    title={lang === "ar" ? "تقليل" : "Decrease"}
                  >
                    <IconMinus size={16} stroke={2.5} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <HorizontalWheelPicker
                      value={waitingCount}
                      onChange={setWaitingCount}
                      min={0}
                      max={30}
                      lang={lang}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setWaitingCount((prev) => Math.min(30, prev + 1))}
                    disabled={waitingCount >= 30}
                    className="w-10 h-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] active:scale-95 disabled:opacity-30 cursor-pointer shrink-0 shadow-2xs transition-transform"
                    title={lang === "ar" ? "زيادة" : "Increase"}
                  >
                    <IconPlus size={16} stroke={2.5} />
                  </button>
                </div>

                {/* Descriptive sublabel */}
                <div className="text-center text-[11px] text-[var(--muted-foreground)]">
                  {waitingCount === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <IconCheck size={13} stroke={2.5} />
                      <span>{lang === "ar" ? "لا يوجد زبائن بالانتظار " : "No waiting customers"}</span>
                    </span>
                  ) : (
                    <span>
                      {lang === "ar"
                        ? ` ${waitingCount} ${waitingCount === 1 ? "زبون" : "زبائن"} بالانتظار الآن`
                        : ` ${waitingCount} customer(s) waiting right now`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Note textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                {lang === "ar" ? "وصف التحديث" : "Update Description"}
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={T.addNotePlaceholder}
                className="text-xs min-h-[68px] resize-none"
                dir={dir}
              />
            </div>

            {/* Photo attachment for credibility */}
            <div className="space-y-2">
              {attachedPhoto ? (
                <div className="relative h-28 rounded-2xl overflow-hidden border border-[var(--border)]">
                  <img
                    src={attachedPhoto}
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer shadow-md"
                  >
                    <IconX size={14} />
                  </button>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white flex items-center gap-1">
                    <IconCheck size={11} className="text-emerald-400" />
                    {T.photoAttached}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-2xl border border-dashed border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] hover:bg-[var(--primary)]/5 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      <IconCamera size={16} className="text-[var(--primary)]" />
                      <span>{lang === "ar" ? "التقاط / رفع صورة" : "Upload / take photo"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit button: Vibrant Orange like the rest of the project */}
            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold py-3.5 rounded-2xl shadow-md cursor-pointer active:scale-98 transition-all text-sm flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === "ar" ? "جاري الإرسال..." : "Submitting..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <IconCheck size={18} stroke={2.5} />
                    <span>{T.submitCommunityUpdate}</span>
                  </span>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
