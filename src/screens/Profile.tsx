import { useState, useEffect, useRef } from "react"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import {
  Button,
  Card,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Textarea,
  Input,
  Badge,
  BottomSheet,
  showSnackbar,
} from "@/components/ui"
import { NavCard } from "@/components/ui/custom"
import {
  IconUser,
  IconSun,
  IconMoon,
  IconWorld,
  IconBell,
  IconHelp,
  IconFileDescription,
  IconLogout,
  IconChevronRight,
  IconChevronLeft,
  IconChevronDown,
  IconHistory,
  IconCheck,
  IconMessageDots,
  IconCamera,
  IconPhone,
  IconMail,
  IconTrash,
  IconLoader2,
  IconWallet,
  IconSparkles,
} from "@tabler/icons-react"
import ChangePhoneScreen from "./ChangePhoneScreen"

interface Props {
  theme: Theme
  lang: Lang
  points?: number
  onToggleTheme: () => void
  onToggleLang?: () => void
  onSelectLang: (lang: Lang) => void
  onLogout: () => void
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

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("user_profile")
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      name: "محمد القمودي",
      phone: "+218 91 234 5678",
      email: "m.algamody@example.com",
      avatar: null as string | null,
    }
  })

  // Edit Profile BottomSheet state
  const [showEditProfileSheet, setShowEditProfileSheet] = useState(false)
  const [editName, setEditName] = useState(userProfile.name)
  const [editEmail, setEditEmail] = useState(userProfile.email)
  const [editAvatar, setEditAvatar] = useState<string | null>(
    userProfile.avatar,
  )
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Full Screen Phone Change state
  const [isChangingPhone, setIsChangingPhone] = useState(false)

  // Sync edit form with profile when sheet opens
  useEffect(() => {
    if (showEditProfileSheet) {
      setEditName(userProfile.name)
      setEditEmail(userProfile.email)
      setEditAvatar(userProfile.avatar)
      setIsSavingProfile(false)
    }
  }, [showEditProfileSheet, userProfile])

  const handleSaveProfile = () => {
    if (isSavingProfile) return
    setIsSavingProfile(true)

    const updated = {
      ...userProfile,
      name: editName.trim() || userProfile.name,
      email: editEmail.trim() || userProfile.email,
      avatar: editAvatar,
    }

    setTimeout(() => {
      setUserProfile(updated)
      try {
        localStorage.setItem("user_profile", JSON.stringify(updated))
      } catch {}
      setIsSavingProfile(false)
      setShowEditProfileSheet(false)
      showSnackbar({
        title:
          lang === "ar"
            ? "تم تحديث البيانات الشخصية بنجاح"
            : "Personal details updated successfully",
        type: "success",
      })
    }, 650)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditAvatar(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

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
              {userProfile.name}
            </h2>
            <p className="text-sm mt-0.5 text-[var(--muted-foreground)]">
              <span
                dir="ltr"
                className="font-sans font-medium inline-block tracking-tight"
              >
                {userProfile.phone}
              </span>
            </p>
          </div>

          {/* Interactive Avatar with Camera Badge */}
          <button
            type="button"
            onClick={() => setShowEditProfileSheet(true)}
            className="relative group cursor-pointer focus:outline-none transition-transform active:scale-95"
            title={lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
          >
            <Avatar
              size="lg"
              className="ring-2 ring-transparent group-hover:ring-[var(--primary)] transition-all"
            >
              {userProfile.avatar ? (
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              ) : (
                <AvatarFallback className="text-[var(--muted-foreground)] bg-[var(--secondary)]">
                  <IconUser size={26} stroke={1.8} />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-0.5 -end-0.5 w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-xs border-2 border-[var(--card)]">
              <IconCamera size={11} stroke={2.5} />
            </div>
          </button>
        </div>

        {/* Balance & Points Cards using NavCard with side chevron and faint watermark icons */}
        <div className="grid grid-cols-2 gap-3 mt-5" dir={dir}>
          <NavCard
            onClick={onViewWallet}
            dir={dir}
            label={lang === "ar" ? "المحفظة" : "Wallet"}
            value="48.00"
            subtext={T.dinar}
            bgIcon={<IconWallet size={48} stroke={1.4} />}
          />
          <NavCard
            onClick={onViewPoints}
            dir={dir}
            label={T.points}
            value={points}
            subtext={T.rewardPoints}
            bgIcon={<IconSparkles size={48} stroke={1.4} />}
          />
        </div>
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
            <div className="flex items-center gap-3">
              <IconHistory
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {T.visitHistory}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
            </div>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--foreground)]">
                {isDark ? (
                  <IconMoon size={18} stroke={2} />
                ) : (
                  <IconSun size={18} stroke={2} />
                )}
              </span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {isDark ? T.darkMode : T.lightMode}
              </span>
            </div>
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
          </button>

          {/* Language selector button (opens bottom sheet modal) */}
          <button
            onClick={() => setShowLangDrawer(true)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <IconWorld
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {T.language}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <span>{lang === "ar" ? "العربية" : "English"}</span>
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
            </div>
          </button>

          {/* Share Feedback in Options List (تحت اللغة) */}
          <button
            type="button"
            onClick={() => setShowFeedbackSheet(true)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--secondary)]/40 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <IconMessageDots
                size={18}
                stroke={2}
                className="text-[var(--foreground)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {lang === "ar" ? "شاركنا برأيك" : "Share Your Feedback"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              {dir === "rtl" ? (
                <IconChevronLeft size={16} stroke={2} />
              ) : (
                <IconChevronRight size={16} stroke={2} />
              )}
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
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  stroke={2}
                  className="text-[var(--foreground)]"
                />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {label}
                </span>
              </div>
              <span className="text-[var(--muted-foreground)]">
                {dir === "rtl" ? (
                  <IconChevronLeft size={16} stroke={2} />
                ) : (
                  <IconChevronRight size={16} stroke={2} />
                )}
              </span>
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
            {/* Text and Flag */}
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">🇱🇾</span>
              <span className="text-base font-semibold text-[var(--foreground)]">
                العربية (Arabic)
              </span>
            </div>

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
            {/* Text and Flag */}
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">🇺🇸</span>
              <span className="text-base font-semibold text-[var(--foreground)]">
                الإنجليزية (English)
              </span>
            </div>

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

      {/* Edit Profile Unified BottomSheet */}
      <BottomSheet
        open={showEditProfileSheet}
        onClose={() => setShowEditProfileSheet(false)}
        title={lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
        description={
          lang === "ar"
            ? "تحديث الصورة والمعلومات الشخصية"
            : "Update photo and personal details"
        }
        dir={dir}
      >
        <div className="mt-2 space-y-4 pb-2" dir={dir}>
          {/* Avatar Edit Section */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar
                size="xl"
                className="w-20 h-20 shadow-md ring-4 ring-[var(--primary)]/20"
              >
                {editAvatar ? (
                  <AvatarImage src={editAvatar} alt={editName} />
                ) : (
                  <AvatarFallback className="text-[var(--muted-foreground)] bg-[var(--secondary)]">
                    <IconUser size={36} stroke={1.8} />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <IconCamera size={22} stroke={2} />
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-md border-2 border-[var(--card)] cursor-pointer"
                title={lang === "ar" ? "تغيير الصورة" : "Change photo"}
              >
                <IconCamera size={14} stroke={2.5} />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer flex items-center gap-1"
              >
                <IconCamera size={13} />
                <span>
                  {lang === "ar" ? "تغيير الصورة الشخصية" : "Change Photo"}
                </span>
              </button>
              {editAvatar && (
                <button
                  type="button"
                  onClick={() => setEditAvatar(null)}
                  className="text-xs font-medium text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <IconTrash size={13} />
                  <span>{lang === "ar" ? "إزالة" : "Remove"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Full Name Input */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-semibold text-[var(--foreground)] px-1">
              {lang === "ar" ? "الاسم" : "Full Name"}
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={lang === "ar" ? "محمد القمودي" : "Your Name"}
              startIcon={
                <IconUser
                  size={18}
                  className="text-[var(--muted-foreground)]"
                />
              }
              className="h-12 rounded-2xl"
              dir={dir}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-semibold text-[var(--foreground)] px-1">
              {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="example@mail.com"
              startIcon={
                <IconMail
                  size={18}
                  className="text-[var(--muted-foreground)]"
                />
              }
              className="h-12 rounded-2xl"
              dir={dir}
            />
          </div>

          {/* Phone Number Row with "تغيير" Button */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-semibold text-[var(--foreground)] px-1">
              {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card-alt)] transition-all">
              <div className="flex items-center gap-2.5">
                <IconPhone
                  size={18}
                  className="text-[var(--muted-foreground)] shrink-0"
                />
                <span
                  dir="ltr"
                  className="font-semibold text-sm text-[var(--foreground)] font-sans"
                >
                  {userProfile.phone}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditProfileSheet(false)
                  setIsChangingPhone(true)
                }}
                className="text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)]/15 bg-[var(--primary)]/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-xs"
              >
                <span>{lang === "ar" ? "تغيير" : "Change"}</span>
              </button>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="pt-2">
            <Button
              size="lg"
              fullWidth
              disabled={isSavingProfile}
              onClick={handleSaveProfile}
              className="h-12 rounded-2xl font-bold shadow-md cursor-pointer transition-all disabled:opacity-85"
            >
              {isSavingProfile ? (
                <span className="flex items-center justify-center gap-2">
                  <IconLoader2 size={20} className="animate-spin" />
                  <span>{lang === "ar" ? "جاري الحفظ..." : "Saving..."}</span>
                </span>
              ) : lang === "ar" ? (
                "حفظ التغييرات"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Full-Screen Change Phone Page (NOT a modal) */}
      {isChangingPhone && (
        <ChangePhoneScreen
          currentPhone={userProfile.phone}
          theme={theme}
          lang={lang}
          onBackToEditSheet={() => {
            setIsChangingPhone(false)
            setShowEditProfileSheet(true)
          }}
          onSuccess={(newPhone) => {
            const updated = { ...userProfile, phone: newPhone }
            setUserProfile(updated)
            try {
              localStorage.setItem("user_profile", JSON.stringify(updated))
            } catch {}
            setIsChangingPhone(false)
            setShowEditProfileSheet(true)
          }}
        />
      )}
    </div>
  )
}
