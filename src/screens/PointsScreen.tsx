import { useState, useRef } from "react"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import {
  Button,
  Card,
  CopyButton,
  showSnackbar,
  BackButton,
} from "@/components/ui"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import {
  IconSparkles,
  IconGift,
  IconPercentage,
  IconTicket,
  IconCheck,
  IconLock,
  IconCircleCheck,
  IconAward,
  IconInfoCircle,
} from "@tabler/icons-react"

interface Props {
  theme: Theme
  lang: Lang
  points: number
  onPointsChange: (newPoints: number) => void
  onBack: () => void
}

interface RewardItem {
  id: string
  title: string
  titleEn: string
  pointsRequired: number
  description: string
  descriptionEn: string
  badge: string
  badgeEn: string
  type: "fixed_discount" | "percent_discount" | "free_service"
}

const REWARDS_CATALOG: RewardItem[] = [
  {
    id: "rw-1",
    title: "خصم 5 دينار",
    titleEn: "5 LYD Discount",
    pointsRequired: 100,
    description: "خصم مباشر بقيمة 5 د.ل على أي حجز قادم لدى الصالونات",
    descriptionEn: "Instant 5 LYD discount on your next booking at any salon",
    badge: "كوبون رصيد",
    badgeEn: "Credit Voucher",
    type: "fixed_discount",
  },
  {
    id: "rw-2",
    title: "جلسة عناية بالبشرة وقناع مجاني",
    titleEn: "Free Facial Care & Mask",
    pointsRequired: 150,
    description: "إضافة مجانية لجلسة تنظيف بشرة وقناع منعش مع أي حلاقة",
    descriptionEn: "Free facial mask & skin care add-on with your haircut",
    badge: "خدمة مجانية",
    badgeEn: "Free Add-on",
    type: "free_service",
  },
  {
    id: "rw-3",
    title: "خصم 10%",
    titleEn: "10% Discount",
    pointsRequired: 200,
    description: "خصم 10% على إجمالي قيمة أي خدمة حلاقة أو باقة",
    descriptionEn: "10% off total service or package cost at any shop",
    badge: "نسبة مئوية",
    badgeEn: "Percentage",
    type: "percent_discount",
  },
  {
    id: "rw-4",
    title: "خصم 15 دينار",
    titleEn: "15 LYD Discount",
    pointsRequired: 300,
    description: "خصم خاص على باقات الحلاقة المتكاملة والـ VIP",
    descriptionEn: "15 LYD off full VIP grooming & style packages",
    badge: "كوبون VIP",
    badgeEn: "VIP Voucher",
    type: "fixed_discount",
  },
  {
    id: "rw-5",
    title: "حلاقة شعر مجانية بالكامل",
    titleEn: "100% Free Haircut",
    pointsRequired: 450,
    description: "قصة وتصفيف شعر مجاناً في أي صالون حلاقة معتمد",
    descriptionEn: "Free full haircut at any verified barber center",
    badge: "حلاقة مجانية",
    badgeEn: "Free Cut",
    type: "free_service",
  },
]

export default function PointsScreen({
  theme,
  lang,
  points,
  onPointsChange,
  onBack,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"

  const [redeemedReward, setRedeemedReward] = useState<{
    reward: RewardItem
    code: string
  } | null>(null)
  const codeCopyBtnRef = useRef<HTMLButtonElement>(null)

  const handleRedeem = (reward: RewardItem) => {
    if (points < reward.pointsRequired) return

    // Deduct points
    const newPoints = points - reward.pointsRequired
    onPointsChange(newPoints)

    // Generate simulated promo code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const voucherCode = `SAVE-${reward.pointsRequired}PTS-${randomSuffix}`

    setRedeemedReward({
      reward,
      code: voucherCode,
    })

    showSnackbar({
      title:
        lang === "ar"
          ? `تم استبدال ${reward.title} بنجاح!`
          : `Redeemed ${reward.titleEn}!`,
      description:
        lang === "ar"
          ? `تم خصم ${reward.pointsRequired} نقطة.`
          : `${reward.pointsRequired} points deducted.`,
      type: "success",
    })
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ backgroundColor: C.bg }}
      dir={dir}
    >
      {/* Screen Header with Back Button */}
      <div className="px-5 pt-12 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <BackButton
            dir={dir}
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--border)] hover:bg-[var(--secondary)]"
            iconSize={20}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[var(--foreground)] truncate">
              {lang === "ar" ? "نقاط المكافآت" : "Reward Points"}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
              {lang === "ar"
                ? "استبدال النقاط بخصومات ومكافآت حصرية"
                : "Redeem points for discounts & rewards"}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <IconSparkles size={22} stroke={2} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-10 space-y-4">
        {/* 1. Top Card: Points Balance (رصيد النقاط بالاعلى) */}
        <Card className="rounded-3xl p-5 bg-[var(--card)] border border-[var(--border)] shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20 mx-auto">
            <IconAward size={14} stroke={2.5} />
            <span>
              {lang === "ar" ? "رصيد نقاطك الحالي" : "Current Points Balance"}
            </span>
          </div>

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
              {points}
            </span>
            <span className="text-sm font-bold text-[var(--muted-foreground)]">
              {lang === "ar" ? "نقطة" : "pts"}
            </span>
          </div>

          {/* User Requested Exact Description Text (نص الوصف المحدد بالطلب) */}
          <div className="pt-2 border-t border-[var(--border)]/70">
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto">
              {lang === "ar"
                ? "اكسب نقاطًا من التقييمات، تأكيد تحديثات حالة المحل، وإكمال الحجوزات."
                : "Earn points from reviews, verifying shop status updates, and completing bookings."}
            </p>
          </div>
        </Card>

        {/* 2. Available Rewards Section (المكافآت المتاحة) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconGift
                size={18}
                stroke={2}
                className="text-[var(--primary)]"
              />
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                {lang === "ar" ? "مكافآت متاحة" : "Available Rewards"}
              </h2>
            </div>
          </div>

          {/* Rewards List */}
          <div className="space-y-3">
            {REWARDS_CATALOG.map((reward) => {
              const isAvailable = points >= reward.pointsRequired
              const remaining = reward.pointsRequired - points
              const progressPercent = Math.min(
                100,
                Math.round((points / reward.pointsRequired) * 100),
              )

              return (
                <Card
                  key={reward.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    isAvailable
                      ? "bg-[var(--card)] border-emerald-500/35 shadow-xs"
                      : "bg-[var(--card)]/70 border-[var(--border)] opacity-90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="text-xs font-bold text-[var(--primary)]">
                          {reward.pointsRequired}{" "}
                          {lang === "ar" ? "نقطة" : "pts"}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[var(--foreground)]">
                        {lang === "ar" ? reward.title : reward.titleEn}
                      </h3>

                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-normal">
                        {lang === "ar"
                          ? reward.description
                          : reward.descriptionEn}
                      </p>
                    </div>

                    {/* Action Button: Redeem or Locked */}
                    <div className="shrink-0 text-end">
                      {isAvailable ? (
                        <Button
                          size="sm"
                          onClick={() => handleRedeem(reward)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 px-3.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          {lang === "ar" ? "استبدال" : "Redeem"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted-foreground)] bg-[var(--secondary)]/60 px-2.5 py-1 rounded-xl">
                          <IconLock size={12} stroke={2.2} />
                          <span>
                            {lang === "ar"
                              ? `متبقي ${remaining}`
                              : `${remaining} pts left`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Locked Rewards */}
                  {!isAvailable && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                        <span>
                          {lang === "ar"
                            ? `التقدم: ${progressPercent}%`
                            : `Progress: ${progressPercent}%`}
                        </span>
                        <span>
                          {points} / {reward.pointsRequired}{" "}
                          {lang === "ar" ? "نقطة" : "pts"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[var(--secondary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. Successful Redemption Voucher Modal (BottomSheet) */}
      {redeemedReward && (
        <BottomSheet
          open={!!redeemedReward}
          onClose={() => setRedeemedReward(null)}
          title={
            lang === "ar"
              ? "تهانينا! تم استبدال المكافأة"
              : "Congratulations! Reward Claimed"
          }
          description={
            lang === "ar"
              ? "يمكنك استخدام كود الخصم التالي عند تأكيد حجزك القادم"
              : "Use the voucher code below during your next booking checkout"
          }
          dir={dir}
        >
          <div className="space-y-4 py-2" dir={dir}>
            {/* Voucher Highlight Card */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-sm">
                <IconCheck size={26} stroke={3} />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {lang === "ar"
                  ? redeemedReward.reward.title
                  : redeemedReward.reward.titleEn}
              </h3>
            </div>

            {/* Voucher Code Box with Copy button */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
                {lang === "ar" ? "كود الخصم الخاص بك" : "Your Voucher Code"}
              </label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] font-mono text-sm font-bold text-[var(--foreground)] tracking-wider">
                <span
                  onClick={() => codeCopyBtnRef.current?.click()}
                  className="cursor-pointer hover:opacity-80 select-all"
                  title={lang === "ar" ? "انقر للنسخ" : "Click to copy"}
                >
                  {redeemedReward.code}
                </span>
                <CopyButton
                  ref={codeCopyBtnRef}
                  text={redeemedReward.code}
                  lang={lang}
                  title={lang === "ar" ? "نسخ كود الخصم" : "Copy voucher code"}
                />
              </div>
            </div>

            <Button
              fullWidth
              onClick={() => setRedeemedReward(null)}
              className="rounded-2xl h-11 font-bold mt-2 cursor-pointer"
            >
              {lang === "ar" ? "حسناً، فهمت" : "Done"}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
