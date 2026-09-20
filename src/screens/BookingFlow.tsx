import { useState } from "react"
import { SHOPS } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Card, Avatar, AvatarImage, Badge } from "@/components/ui"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCreditCard,
  IconCash,
  IconAlertTriangle,
  IconCheck,
  IconStarFilled,
  IconTicket,
  IconX,
  IconSparkles,
} from "@tabler/icons-react"

interface Props {
  shopId: string
  serviceId: string
  theme: Theme
  lang: Lang
  onBack: () => void
  onConfirm: () => void
}

export default function BookingFlow({
  shopId,
  serviceId,
  theme,
  lang,
  onBack,
  onConfirm,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const shop = SHOPS.find((s) => s.id === shopId)!
  const service = shop.services.find((s) => s.id === serviceId)!
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [payment, setPayment] = useState<"wallet" | "cash">("wallet")
  const [step, setStep] = useState<1 | 2>(1)
  const [showCashWarning, setShowCashWarning] = useState(false)
  const chosenStaff = shop.staff.find((s) => s.id === selectedStaff)

  // Promo Code State
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    title: string
    discount: number
  } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyPromo = () => {
    const trimmed = promoCode.trim().toUpperCase()
    if (!trimmed) return

    setIsApplying(true)
    setPromoError(null)

    setTimeout(() => {
      setIsApplying(false)
      if (
        trimmed.includes("100PTS") ||
        trimmed === "SAVE5" ||
        trimmed === "DISCOUNT5" ||
        trimmed === "WELCOME"
      ) {
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "خصم 5 دينار (كود المكافآت)"
              : "5 LYD Discount (Reward Code)",
          discount: 5,
        })
      } else if (
        trimmed.includes("200PTS") ||
        trimmed === "SAVE10" ||
        trimmed === "10%"
      ) {
        const disc = Math.round((service.price * 10) / 100)
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "خصم 10% (كود المكافآت)"
              : "10% Discount (Reward Code)",
          discount: disc > 0 ? disc : 3,
        })
      } else if (
        trimmed.includes("150PTS") ||
        trimmed === "FACIAL" ||
        trimmed === "MASK"
      ) {
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "جلسة قناع وعناية مجانية (خصم 8 د.ل)"
              : "Free Facial Mask (8 LYD off)",
          discount: 8,
        })
      } else if (trimmed.includes("300PTS") || trimmed === "VIP15") {
        setAppliedPromo({
          code: trimmed,
          title: lang === "ar" ? "خصم 15 دينار VIP" : "15 LYD VIP Discount",
          discount: 15,
        })
      } else if (trimmed.includes("450PTS") || trimmed === "FREE") {
        setAppliedPromo({
          code: trimmed,
          title: lang === "ar" ? "حلاقة مجانية بالكامل" : "100% Free Haircut",
          discount: service.price,
        })
      } else if (
        trimmed.startsWith("SAVE-") ||
        trimmed.startsWith("RC-") ||
        trimmed.length >= 4
      ) {
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "كود خصم النقاط الترويجي (5 د.ل)"
              : "Points Promo Voucher (5 LYD)",
          discount: 5,
        })
      } else {
        setPromoError(
          lang === "ar"
            ? "كود الخصم المدخل غير صالح أو منتهي الصلاحية"
            : "Invalid or expired promo code",
        )
      }
    }, 200)
  }

  const basePrice = service.price
  const discount = appliedPromo ? Math.min(basePrice, appliedPromo.discount) : 0
  const finalPrice = Math.max(0, basePrice - discount)

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header with step indicator */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-[var(--border)]">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="text-[var(--muted-foreground)]"
        >
          {dir === "rtl" ? (
            <IconArrowRight size={18} stroke={2} />
          ) : (
            <IconArrowLeft size={18} stroke={2} />
          )}
        </Button>
        <div className="flex-1" dir={dir}>
          <h2
            className="text-lg font-light text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {step === 1 ? T.chooseBarber : T.confirmBooking}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {lang === "ar" ? shop.nameAr : shop.name} ·{" "}
            {lang === "ar" ? service.name : service.nameEn}
          </p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-300"
              style={{
                width: step >= s ? 16 : 6,
                height: 6,
                backgroundColor: step >= s ? C.gold : C.border,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-5 py-5">
        {step === 1 && (
          <div dir={dir} className="space-y-3">
            <p className="text-xs tracking-widest uppercase mb-4 text-[var(--muted-foreground)]">
              {T.chooseBarber}?
            </p>

            {/* Any barber option */}
            <Card
              interactive
              onClick={() => setSelectedStaff("any")}
              className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                selectedStaff === "any"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedStaff === "any" && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--primary)] text-black">
                    <IconCheck size={11} stroke={3.5} />
                  </span>
                )}
                <span className="text-xs text-[var(--muted-foreground)]">
                  {T.leastWait}
                </span>
              </div>
              <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {T.anyBarber}
                </p>
                <p className="text-xs mt-0.5 text-[var(--muted-foreground)]">
                  {T.autoAssign}
                </p>
              </div>
            </Card>

            {/* Barber list */}
            {shop.staff.map((st) => {
              const isInactive = st.isActive === false
              const isSelected = selectedStaff === st.id
              const inactiveReasonText =
                st.inactiveReason
                  ? lang === "ar"
                    ? st.inactiveReason.ar
                    : st.inactiveReason.en
                  : T.barberUnavailable

              return (
                <Card
                  key={st.id}
                  interactive={!isInactive}
                  onClick={() => {
                    if (!isInactive) setSelectedStaff(st.id)
                  }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                    isInactive
                      ? "opacity-55 cursor-not-allowed bg-[var(--muted)]/30 border-dashed border-[var(--border)]"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--primary)] text-black">
                        <IconCheck size={11} stroke={3.5} />
                      </span>
                    )}
                    <div
                      style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                    >
                      {isInactive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-500 border border-zinc-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          <span>{inactiveReasonText}</span>
                        </span>
                      ) : (
                        <>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {st.queue} {T.waiting2}
                          </span>
                          <p className="text-xs font-bold text-[var(--primary)]">
                            ~{st.avgWait} {T.mins}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex-1"
                    style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        isInactive
                          ? "text-[var(--muted-foreground)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {st.name}
                    </p>
                    <p className="text-xs text-[var(--primary)] font-medium flex items-center gap-1 opacity-80">
                      <IconStarFilled size={12} />
                      <span>{st.rating}</span>
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <Avatar
                      size="default"
                      className={isInactive ? "opacity-75 grayscale-[35%]" : ""}
                    >
                      <AvatarImage src={st.photo} alt={st.name} />
                    </Avatar>
                    {isInactive && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-400 border-2 border-[var(--card)]"
                        title={T.inactiveBarber}
                      />
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {step === 2 && (
          <div dir={dir} className="space-y-4">
            {/* Booking summary Card */}
            <Card className="rounded-2xl px-4 py-4 space-y-3 border-[var(--border)] bg-[var(--card)]">
              <p className="text-xs tracking-widest uppercase text-[var(--muted-foreground)]">
                {T.bookingSummary}
              </p>
              {[
                {
                  label: T.shop,
                  value: lang === "ar" ? shop.nameAr : shop.name,
                },
                {
                  label: T.service,
                  value: `${
                    lang === "ar" ? service.name : service.nameEn
                  } — ${service.price} ${lang === "ar" ? "د.ل" : "LYD"}`,
                },
                { label: T.barber, value: chosenStaff?.name ?? T.anyBarber },
                {
                  label: T.waitTime,
                  value: chosenStaff
                    ? `~${chosenStaff.avgWait} ${T.min}`
                    : T.leastWait,
                },
                {
                  label: T.queuePos,
                  value: chosenStaff ? `#${chosenStaff.queue + 1}` : T.auto,
                },
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

            {/* Discount Code Input Section (مساحة إدخال كود الخصم) */}
            <Card className="rounded-2xl p-4 space-y-2.5 border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-widest uppercase font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <IconTicket size={16} className="text-[var(--primary)]" />
                  <span>{lang === "ar" ? "كود الخصم" : "Discount Code"}</span>
                </span>
                {appliedPromo && (
                  <Badge
                    variant="success"
                    className="text-[10px] px-2 py-0.5 font-bold"
                  >
                    {lang === "ar" ? "تم التفعيل" : "Applied"}
                  </Badge>
                )}
              </div>

              {!appliedPromo ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value)
                          setPromoError(null)
                        }}
                        placeholder={
                          lang === "ar"
                            ? "أدخل كود الخصم ..."
                            : "Enter promo code ..."
                        }
                        className="w-full h-10 px-3.5 pe-8 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-xs font-mono font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)] placeholder:font-sans uppercase"
                        dir={dir}
                      />
                      {promoCode && (
                        <button
                          type="button"
                          onClick={() => {
                            setPromoCode("")
                            setPromoError(null)
                          }}
                          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                        >
                          <IconX size={14} />
                        </button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || isApplying}
                      className="rounded-xl h-10 px-4 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      {isApplying ? "..." : lang === "ar" ? "تطبيق" : "Apply"}
                    </Button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 pt-0.5">
                      <IconAlertTriangle size={13} stroke={2.5} />
                      <span>{promoError}</span>
                    </p>
                  )}

                  <p className="text-[10px] text-[var(--muted-foreground)] leading-normal">
                    {lang === "ar"
                      ? "💡 يمكنك الحصول على أكواد خصم باستبدال نقاطك في صفحة نقاط المكافآت بحسابك."
                      : "💡 Redeem points in your profile to obtain discount voucher codes."}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <IconCheck size={18} stroke={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[var(--foreground)]">
                          {appliedPromo.code}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                          -{discount} {lang === "ar" ? "د.ل" : "LYD"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {appliedPromo.title}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null)
                      setPromoCode("")
                    }}
                    className="w-7 h-7 rounded-lg bg-[var(--card)] hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 border border-[var(--border)] flex items-center justify-center transition-colors cursor-pointer"
                    title={lang === "ar" ? "إلغاء الكود" : "Remove"}
                  >
                    <IconX size={14} stroke={2.2} />
                  </button>
                </div>
              )}

              {/* Price calculation row */}
              <div className="pt-2 border-t border-[var(--border)]/70 flex items-center justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">
                  {lang === "ar" ? "المبلغ الإجمالي:" : "Total Price:"}
                </span>
                <div className="flex items-baseline gap-1.5">
                  {appliedPromo && (
                    <span className="line-through text-[var(--muted-foreground)] text-xs">
                      {basePrice} {lang === "ar" ? "د.ل" : "LYD"}
                    </span>
                  )}
                  <span className="text-sm font-extrabold text-[var(--primary)]">
                    {finalPrice} {lang === "ar" ? "د.ل" : "LYD"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payment method selection */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-3 text-[var(--muted-foreground)]">
                {T.paymentMethod}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["wallet", "cash"] as const).map((m) => {
                  const isSelected = payment === m
                  return (
                    <Card
                      key={m}
                      interactive
                      onClick={() => {
                        setPayment(m)
                        setShowCashWarning(m === "cash")
                      }}
                      className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--card)]"
                      }`}
                    >
                      <span
                        className={
                          isSelected
                            ? "text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]"
                        }
                      >
                        {m === "wallet" ? (
                          <IconCreditCard size={24} stroke={1.8} />
                        ) : (
                          <IconCash size={24} stroke={1.8} />
                        )}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isSelected
                            ? "text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {m === "wallet" ? T.wallet : T.cash}
                      </span>
                      {m === "wallet" && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {T.balance}: 48 {lang === "ar" ? "د.ل" : "LYD"}
                        </span>
                      )}
                    </Card>
                  )
                })}
              </div>

              {/* Cash warning Card */}
              {showCashWarning && payment === "cash" && (
                <Card
                  className="mt-3 rounded-xl px-4 py-3 text-xs leading-relaxed border-red-500/30 bg-red-500/10 text-[var(--muted-foreground)]"
                  dir={dir}
                >
                  <p className="font-semibold mb-1 text-red-500 flex items-center gap-1.5">
                    <IconAlertTriangle size={15} stroke={2.2} />
                    <span>
                      {lang === "ar"
                        ? "تنبيه مهم — الدفع النقدي"
                        : "Important — Cash Payment"}
                    </span>
                  </p>
                  <p>
                    {lang === "ar"
                      ? "إذا لم تكن متواجداً في المحل عند حلول دورك، سيُسجَّل غيابك تلقائياً وسيُوقَف خيار الدفع النقدي من حسابك. ستُضطر للدفع عبر المحفظة في جميع حجوزاتك اللاحقة."
                      : "If you are not present at the shop when your turn arrives, a no-show will be recorded and cash payment will be disabled on your account. All future bookings will require wallet payment."}
                  </p>
                </Card>
              )}
            </div>

            <Card
              className="rounded-xl px-4 py-3 text-xs leading-relaxed border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--muted-foreground)]"
              dir={dir}
            >
              {T.cancelWarning(10)}
            </Card>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 py-4"
        style={{
          background: `linear-gradient(to top, ${C.bg} 70%, transparent)`,
        }}
      >
        <Button
          size="lg"
          fullWidth
          disabled={!selectedStaff}
          onClick={() => {
            if (step === 1 && selectedStaff) setStep(2)
            else if (step === 2) onConfirm()
          }}
          className="h-12 rounded-2xl font-bold shadow-md cursor-pointer"
        >
          {step === 1 ? T.next : `${T.confirmBtn} (${finalPrice} ${lang === "ar" ? "د.ل" : "LYD"})`}
        </Button>
      </div>
    </div>
  )
}
