import { useState } from "react"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import {
  Button,
  Card,
  Avatar,
  AvatarFallback,
  Textarea,
  Badge,
  BottomSheet,
} from "@/components/ui"
import {
  IconUser,
  IconSun,
  IconMoon,
  IconWorld,
  IconFileText,
  IconBell,
  IconHelp,
  IconFileDescription,
  IconLogout,
  IconStarFilled,
  IconChevronRight,
  IconChevronLeft,
  IconChevronDown,
  IconHistory,
  IconCheck,
  IconMessageDots,
} from "@tabler/icons-react"

interface Props {
  theme: Theme
  lang: Lang
  points?: number
  onToggleTheme: () => void
  onToggleLang?: () => void
  onSelectLang: (lang: Lang) => void
  onLogout: () => void
  onExport: () => void
  onViewBookings?: () => void
  onViewWallet?: () => void
  onViewPoints?: () => void
}

const HISTORY = [
  {
    shop: "رويال كت",
    service: "شعر + لحية",
    date: "12 سبتمبر 2026",
    price: 22,
    rating: 5,
  },
  {
    shop: "كلاسيك باربر",
    service: "حلاقة شعر",
    date: "5 سبتمبر 2026",
    price: 12,
    rating: 4,
  },
  {
    shop: "رويال كت",
    service: "حلاقة شعر",
    date: "28 أغسطس 2026",
    price: 15,
    rating: 5,
  },
]

export default function Profile({
  theme,
  lang,
  points = 175,
  onToggleTheme,
  onSelectLang,
  onLogout,
  onExport,
  onViewBookings,
  onViewWallet,
  onViewPoints,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const isDark = theme === "dark"

  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false)
  const [showLangDrawer, setShowLangDrawer] = useState(false)
  const [pendingLang, setPendingLang] = useState<Lang | null>(null)

  const handleSelectLanguage = (targetLang: Lang) => {
    setPendingLang(targetLang)
    // Smooth micro-interaction: show selection feedback, then slide sheet down smoothly
    setTimeout(() => {
      onSelectLang(targetLang)
      setShowLangDrawer(false)
      setPendingLang(null)
    }, 220)
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ backgroundColor: C.bg }}
    >
      {/* Profile Header */}
      <div className="px-5 pt-12 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-4" dir={dir}>
          <div
            className="flex-1"
            style={{ textAlign: dir === "rtl" ? "right" : "left" }}
          >
            <h2
              className="text-xl font-light text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              محمد القمودي
            </h2>
            <p className="text-sm mt-0.5 text-[var(--muted-foreground)]">
              +218 91 234 5678
            </p>
          </div>
          <Avatar size="lg">
            <AvatarFallback className="text-[var(--muted-foreground)]">
              <IconUser size={26} stroke={1.8} />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Balance & Points Cards using unified Card */}
        <div className="grid grid-cols-2 gap-3 mt-5" dir={dir}>
          <Card
            onClick={onViewWallet}
            className="rounded-2xl px-4 py-4 border-[var(--border)] bg-[var(--card)] cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--secondary)]/30 transition-all active:scale-[0.98]"
          >
            <p className="text-xs tracking-widest uppercase mb-1 text-[var(--muted-foreground)] font-semibold">
              {lang === "ar" ? "المحفظة" : "Wallet"}
            </p>
            <p className="text-2xl font-bold text-[var(--foreground)]">48</p>
            <p className="text-xs text-[var(--muted-foreground)]">{T.dinar}</p>
          </Card>
          <Card
            onClick={onViewPoints}
            className="rounded-2xl px-4 py-4 border-[var(--border)] bg-[var(--card)] cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--secondary)]/30 transition-all active:scale-[0.98]"
          >
            <p className="text-xs tracking-widest uppercase mb-1 text-[var(--muted-foreground)] font-semibold">
              {T.points}
            </p>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {points}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {T.rewardPoints}
            </p>
          </Card>
        </div>

        <Button
          size="default"
          fullWidth
          onClick={onViewWallet}
          className="mt-3 cursor-pointer"
        >
          {T.topUp}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" dir={dir}>
        {/* Settings and Options List */}
        <Card className="rounded-2xl overflow-hidden p-0 border-[var(--border)] bg-[var(--card)]">
          {/* Visit History in Options List */}
          <button
            type="button"
            onClick={onViewBookings}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {T.visitHistory}
              </span>
              <IconHistory
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
            </div>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40"
          >
            <div
              className="relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center"
              style={{ backgroundColor: isDark ? C.gold : C.border }}
            >
              <div
                className="absolute w-4 h-4 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#ffffff",
                  left: isDark ? "calc(100% - 20px)" : 4,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {isDark ? T.darkMode : T.lightMode}
              </span>
              <span className="text-[var(--foreground)]">
                {isDark ? (
                  <IconMoon size={18} stroke={2} />
                ) : (
                  <IconSun size={18} stroke={2} />
                )}
              </span>
            </div>
          </button>

          {/* Language selector button (opens bottom sheet modal) */}
          <button
            onClick={() => setShowLangDrawer(true)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40"
          >
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <span>{lang === "ar" ? "العربية" : "English"}</span>
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {T.language}
              </span>
              <IconWorld
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
            </div>
          </button>

          {/* Share Feedback in Options List (تحت اللغة) */}
          <button
            type="button"
            onClick={() => setShowFeedbackSheet(true)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {lang === "ar" ? "شاركنا برأيك" : "Share Your Feedback"}
              </span>
              <IconMessageDots
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
            </div>
          </button>

          {/* Export PDF */}
          <button
            onClick={onExport}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40"
          >
            <span className="text-[var(--muted-foreground)]">
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {lang === "ar" ? "تصدير الشاشات PDF" : "Export Screens PDF"}
              </span>
              <IconFileText
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
            </div>
          </button>

          {[
            { Icon: IconHelp, label: T.helpSupport },
            { Icon: IconFileDescription, label: T.termsPrivacy },
          ].map(({ Icon, label }, i, arr) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-4 ${
                i < arr.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <span className="text-[var(--muted-foreground)]">
                {dir === "rtl" ? (
                  <IconChevronLeft size={16} stroke={2} />
                ) : (
                  <IconChevronRight size={16} stroke={2} />
                )}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {label}
                </span>
                <Icon
                  size={18}
                  stroke={2}
                  className="text-[var(--foreground)]"
                />
              </div>
            </div>
          ))}
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          size="default"
          fullWidth
          onClick={onLogout}
          className="bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20 gap-2"
        >
          <IconLogout size={17} stroke={2} />
          <span>{T.logout}</span>
        </Button>
      </div>

      {/* Language Selection Unified BottomSheet */}
      <BottomSheet
        open={showLangDrawer}
        onClose={() => setShowLangDrawer(false)}
        title="لغة التطبيق(Language)"
        dir={dir}
      >
        <div className="mt-2 space-y-3 pb-2">
          {/* Arabic */}
          <button
            type="button"
            onClick={() => handleSelectLanguage("ar")}
            className={`w-full flex items-center justify-between py-3 px-3 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              pendingLang === "ar" || (!pendingLang && lang === "ar")
                ? "bg-[var(--primary)]/10 border border-[var(--primary)]/40 shadow-xs"
                : "hover:bg-[var(--secondary)]/40 border border-transparent"
            } ${pendingLang === "ar" ? "animate-select-pulse" : ""}`}
          >
            {/* Radio Indicator */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                pendingLang === "ar" || (!pendingLang && lang === "ar")
                  ? "bg-[#e8722a] text-white shadow-sm scale-105"
                  : "border-2 border-zinc-300 dark:border-zinc-600 bg-transparent"
              }`}
            >
              {(pendingLang === "ar" || (!pendingLang && lang === "ar")) && (
                <IconCheck size={14} stroke={3.5} />
              )}
            </div>

            {/* Text and Flag */}
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-[var(--foreground)]">
                العربية (Arabic)
              </span>
              <span className="text-2xl leading-none">🇱🇾</span>
            </div>
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => handleSelectLanguage("en")}
            className={`w-full flex items-center justify-between py-3 px-3 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              pendingLang === "en" || (!pendingLang && lang === "en")
                ? "bg-[var(--primary)]/10 border border-[var(--primary)]/40 shadow-xs"
                : "hover:bg-[var(--secondary)]/40 border border-transparent"
            } ${pendingLang === "en" ? "animate-select-pulse" : ""}`}
          >
            {/* Radio Indicator */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                pendingLang === "en" || (!pendingLang && lang === "en")
                  ? "bg-[#e8722a] text-white shadow-sm scale-105"
                  : "border-2 border-zinc-300 dark:border-zinc-600 bg-transparent"
              }`}
            >
              {(pendingLang === "en" || (!pendingLang && lang === "en")) && (
                <IconCheck size={14} stroke={3.5} />
              )}
            </div>

            {/* Text and Flag */}
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-[var(--foreground)]">
                الإنجليزية (English)
              </span>
              <span className="text-2xl leading-none">🇺🇸</span>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Share Feedback BottomSheet */}
      <BottomSheet
        open={showFeedbackSheet}
        onClose={() => setShowFeedbackSheet(false)}
        title={lang === "ar" ? "شاركنا برأيك" : "Share Your Feedback"}
        description={
          lang === "ar"
            ? "نسعد دائماً بسماع ملاحظاتك أو أي طلب خاص للزيارات القادمة"
            : "We'd love to hear your feedback or special requests"
        }
        dir={dir}
      >
        <div className="mt-2 space-y-3 pb-2" dir={dir}>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              lang === "ar"
                ? "شاركنا رأيك أو أي طلب خاص للزيارات القادمة..."
                : "Share your feedback or special requests..."
            }
            className="text-xs min-h-[90px] rounded-2xl"
            dir={dir}
          />
          <Button
            size="default"
            fullWidth
            disabled={!feedback.trim() || feedbackSent}
            onClick={() => {
              setFeedbackSent(true)
              setTimeout(() => {
                setFeedback("")
                setFeedbackSent(false)
                setShowFeedbackSheet(false)
              }, 1800)
            }}
            className="h-11 rounded-2xl font-bold cursor-pointer"
          >
            {feedbackSent ? (
              <span className="inline-flex items-center gap-1.5">
                <IconCheck size={16} stroke={2.5} />
                <span>
                  {lang === "ar" ? "تم الإرسال، شكراً لك!" : "Sent, Thank you!"}
                </span>
              </span>
            ) : lang === "ar" ? (
              "إرسال الملاحظة"
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
