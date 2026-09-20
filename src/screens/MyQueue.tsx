import { useState, useEffect, useRef } from "react"
import { MY_BOOKING } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Card } from "@/components/ui"
import { IconX, IconCheck, IconScissors } from "@tabler/icons-react"
import ReviewBottomSheet from "../components/ReviewBottomSheet"

interface Props {
  theme: Theme
  lang: Lang
  onClose: () => void
}

export default function MyQueue({ theme, lang, onClose }: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const booking = MY_BOOKING
  const [status, setStatus] =
    useState<"in_queue" | "next_up" | "in_progress" | "completed">(
      booking.status,
    )
  const [showReview, setShowReview] = useState(false)
  const [countdown, setCountdown] = useState(10 * 60)
  const [confirmed, setConfirmed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== "next_up" || confirmed) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(
      () => setCountdown((c) => (c > 0 ? c - 1 : 0)),
      1000,
    )
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status, confirmed])

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  const advance = () => {
    if (status === "in_queue") setStatus("next_up")
    else if (status === "next_up" && confirmed) setStatus("in_progress")
    else if (status === "in_progress") {
      setStatus("completed")
      setTimeout(() => setShowReview(true), 600)
    }
  }

  const statusLabels: Record<string, string> = {
    in_queue: T.inQueue,
    next_up: T.nextUp,
    in_progress: T.statusInProgress,
    completed: T.statusCompleted,
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header with close button */}
      <div
        className="px-5 pt-12 pb-5 flex items-center justify-between border-b border-[var(--border)]"
        dir={dir}
      >
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onClose}
          className="rounded-full text-xs font-semibold"
        >
          <IconX size={15} stroke={2.5} />
        </Button>
        <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
          <p className="text-xs tracking-widest uppercase text-[var(--muted-foreground)]">
            {T.currentBooking}
          </p>
          <h2
            className="text-xl font-light text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {booking.shopName}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {booking.staffName} · {booking.service}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 space-y-4">
        {/* Main queue card using unified Card */}
        <Card
          className="rounded-3xl px-5 py-6 border-[var(--border)] bg-[var(--card)]"
          dir={dir}
        >
          {status === "completed" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500/15 border-2 border-emerald-500">
                <IconCheck size={32} stroke={3} className="text-emerald-500" />
              </div>
              <p
                className="text-lg font-light text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {T.visitComplete}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {T.hopeSatisfied}
              </p>
              <Button
                size="default"
                className="mt-2 rounded-full cursor-pointer font-semibold"
                onClick={() => setShowReview(true)}
              >
                {T.leaveReview}
              </Button>
            </div>
          ) : status === "in_progress" ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse bg-[var(--primary)]/15 border-2 border-[var(--primary)]">
                <IconScissors
                  size={26}
                  stroke={2.2}
                  className="text-[var(--primary)]"
                />
              </div>
              <p className="text-base font-semibold text-[var(--primary)]">
                {T.inProgress}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {T.yourTurnWith(booking.staffName)}
              </p>
            </div>
          ) : status === "next_up" ? (
            <div className="space-y-4">
              <Card className="rounded-2xl px-4 py-4 text-center bg-[var(--primary)]/10 border-[var(--primary)]/30">
                <p className="text-xs tracking-widest uppercase mb-2 text-[var(--primary)] font-semibold">
                  {T.youreNext}
                </p>
                <p
                  className="text-3xl font-light mb-1 text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(mins).padStart(2, "0")}:
                  {String(secs).padStart(2, "0")}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {T.timeLeft}
                </p>
              </Card>
              {!confirmed ? (
                <Button size="lg" fullWidth onClick={() => setConfirmed(true)}>
                  {T.confirmAttendance}
                </Button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl text-sm font-semibold text-center bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center gap-1.5">
                  <IconCheck size={16} stroke={2.5} />
                  <span>{T.confirmed}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-4xl font-light text-[var(--foreground)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    #{booking.position}
                  </p>
                  <p className="text-xs mt-0.5 text-[var(--muted-foreground)]">
                    {T.queuePosition}
                  </p>
                </div>
                <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                  <p className="text-2xl font-semibold text-[var(--primary)]">
                    ~{booking.estimatedWait}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {T.minutesWait}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: booking.totalAhead + 2 }).map((_, i) => {
                  const isMe = i === booking.position - 1
                  const isDone = i < booking.position - 1
                  return (
                    <div
                      key={i}
                      className="flex-1 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: isDone
                          ? C.green
                          : isMe
                            ? C.gold
                            : C.border,
                      }}
                    />
                  )
                })}
              </div>
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                {T.peopleAhead(booking.position - 1)}
              </p>
            </div>
          )}
        </Card>

        {/* Booking details card */}
        <Card
          className="rounded-2xl px-4 py-4 space-y-3 border-[var(--border)] bg-[var(--card)]"
          dir={dir}
        >
          {[
            { label: T.bookingId, value: booking.bookingId },
            {
              label: T.payMethod,
              value:
                booking.paymentMethod === "wallet" ? T.walletPay : T.cashPay,
            },
            { label: T.status, value: statusLabels[status] },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {value}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {label}
              </span>
            </div>
          ))}
        </Card>

        {status !== "completed" && (
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={advance}
            className="text-xs text-[var(--muted-foreground)] opacity-50 hover:opacity-100"
          >
            {T.demoStep}
          </Button>
        )}
      </div>

      {/* Rating & Review BottomSheet upon haircut completion */}
      <ReviewBottomSheet
        open={showReview}
        onClose={() => setShowReview(false)}
        lang={lang}
        shopName={booking.shopName}
        defaultService={booking.service}
      />
    </div>
  )
}
