import { useState, useEffect, useRef } from "react"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Input, Card, BackButton } from "@/components/ui"
import {
  IconDeviceMobile,
  IconShieldCheck,
  IconCheck,
  IconRotateClockwise,
} from "@tabler/icons-react"

interface ChangePhoneScreenProps {
  currentPhone: string
  theme: Theme
  lang: Lang
  onBackToEditSheet: () => void
  onSuccess: (newPhone: string) => void
}

export default function ChangePhoneScreen({
  currentPhone,
  theme,
  lang,
  onBackToEditSheet,
  onSuccess,
}: ChangePhoneScreenProps) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [newPhone, setNewPhone] = useState("")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [otp, setOtp] = useState(["", "", "", ""])
  const [otpError, setOtpError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(45)
  const [isSuccess, setIsSuccess] = useState(false)

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  const handlePhoneSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleaned = newPhone.replace(/\D/g, "")
    if (cleaned.length < 8) {
      setPhoneError(
        lang === "ar"
          ? "يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)"
          : "Please enter a valid phone number (at least 8 digits)",
      )
      return
    }
    setPhoneError(null)
    setOtp(["", "", "", ""])
    setOtpError(null)
    setCountdown(45)
    setStep("otp")
    setTimeout(() => {
      otpInputRefs[0].current?.focus()
    }, 100)
  }

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setOtpError(null)

    if (digit && index < 3) {
      otpInputRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs[index - 1].current?.focus()
    } else if (e.key === "ArrowRight" && index < 3) {
      otpInputRefs[index + 1].current?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4)
    if (pasted) {
      const newOtp = [...otp]
      for (let i = 0; i < 4; i++) {
        newOtp[i] = pasted[i] || ""
      }
      setOtp(newOtp)
      const nextFocus = Math.min(pasted.length, 3)
      otpInputRefs[nextFocus].current?.focus()
    }
  }

  const handleOtpSubmit = () => {
    const code = otp.join("")
    if (code.length < 4) {
      setOtpError(
        lang === "ar"
          ? "يرجى إدخال رمز التحقق كاملاً (4 أرقام)"
          : "Please enter all 4 digits",
      )
      return
    }

    // Accept 1234 or any 4 digits
    setIsSuccess(true)
    const formattedPhone = `+218 ${newPhone}`
    setTimeout(() => {
      onSuccess(formattedPhone)
    }, 900)
  }

  const handleResendCode = () => {
    if (countdown > 0) return
    setCountdown(45)
    setOtp(["", "", "", ""])
    setOtpError(null)
    otpInputRefs[0].current?.focus()
  }

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone")
      setOtpError(null)
    } else {
      onBackToEditSheet()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col h-full bg-[var(--background)] animate-modal-enter"
      style={{ backgroundColor: C.bg }}
      dir={dir}
    >
      {/* Top Header Navigation */}
      <div className="pt-12 pb-3 px-5 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md flex items-center justify-between shrink-0 shadow-xs">
        <BackButton
          dir={dir}
          onClick={handleBack}
          className="w-10 h-10 border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] shadow-xs"
          iconSize={20}
          iconStroke={2.2}
        />

        <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
          {step === "phone"
            ? lang === "ar"
              ? "تغيير رقم الهاتف"
              : "Change Phone Number"
            : lang === "ar"
              ? "رمز التحقق"
              : "Verification Code"}
        </h1>

        <div className="w-10" />
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-between">
        {step === "phone" ? (
          /* Step 1: Enter New Phone */
          <div className="w-full max-w-sm mx-auto space-y-6 flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] flex items-center justify-center shadow-xs">
              <IconDeviceMobile size={32} stroke={2} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {lang === "ar"
                  ? "أدخل رقم هاتفك الجديد"
                  : "Enter your new phone number"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                {lang === "ar"
                  ? "سنرسل لك رمز تحقق (OTP) عبر رسالة SMS للتأكد من هويتك وتحديث بياناتك."
                  : "We will send you a verification code (OTP) via SMS to verify your new phone number."}
              </p>
            </div>

            {/* Current Phone display */}
            <div className="w-full text-xs text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex items-center justify-between">
              <span>{lang === "ar" ? "الرقم الحالي:" : "Current number:"}</span>
              <span
                dir="ltr"
                className="font-semibold text-[var(--foreground)]"
              >
                {currentPhone}
              </span>
            </div>

            {/* New Phone Input */}
            <div className="w-full space-y-2 text-start">
              <label className="text-xs font-semibold text-[var(--foreground)] px-1">
                {lang === "ar" ? "رقم الهاتف الجديد" : "New Phone Number"}
              </label>
              <Input
                value={newPhone}
                onChange={(e) => {
                  setNewPhone(e.target.value.replace(/\D/g, ""))
                  setPhoneError(null)
                }}
                placeholder="91 234 5678"
                inputMode="numeric"
                maxLength={10}
                dir="ltr"
                className="text-left font-medium h-13 rounded-2xl text-base"
                startIcon={
                  <div className="flex items-center gap-1.5 pr-2.5 mr-2 border-r border-[var(--border)] select-none">
                    <span className="text-lg leading-none">🇱🇾</span>
                    <span className="text-xs font-bold text-[var(--foreground)] tracking-tight">
                      +218
                    </span>
                  </div>
                }
              />
              {phoneError && (
                <p className="text-xs text-red-500 px-1 font-medium">
                  {phoneError}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Enter OTP */
          <div className="w-full max-w-sm mx-auto space-y-6 flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] flex items-center justify-center shadow-xs">
              <IconShieldCheck size={32} stroke={2} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {lang === "ar" ? "أدخل رمز التحقق" : "Enter Verification Code"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                {lang === "ar"
                  ? "تم إرسال رمز تأكيد مكون من 4 أرقام إلى:"
                  : "A 4-digit verification code was sent to:"}
              </p>
              <div
                dir="ltr"
                className="font-bold text-sm text-[var(--primary)] mt-1"
              >
                +218 {newPhone}
              </div>
            </div>

            {/* 4 Discrete OTP Input Boxes */}
            <div className="flex gap-3 justify-center py-2" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpInputRefs[i]}
                  value={digit}
                  dir="ltr"
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  className={`w-14 h-15 text-center text-2xl font-bold rounded-2xl outline-none transition-all border ${
                    digit
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] ring-2 ring-[var(--primary)]/20"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                  } focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]`}
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-red-500 font-medium">{otpError}</p>
            )}

            {/* Resend Code Option */}
            <div className="text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-1.5">
              {countdown > 0 ? (
                <span>
                  {lang === "ar"
                    ? `إعادة إرسال الرمز خلال 0:${countdown
                        .toString()
                        .padStart(2, "0")}`
                    : `Resend code in 0:${countdown
                        .toString()
                        .padStart(2, "0")}`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <IconRotateClockwise size={14} />
                  <span>
                    {lang === "ar"
                      ? "إعادة إرسال الرمز الآن"
                      : "Resend code now"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="w-full max-w-sm mx-auto pb-4 pt-6">
          {step === "phone" ? (
            <Button
              size="lg"
              fullWidth
              disabled={newPhone.replace(/\D/g, "").length < 8}
              onClick={handlePhoneSubmit}
              className="h-13 rounded-2xl font-bold text-base shadow-md cursor-pointer"
            >
              {lang === "ar" ? "متابعة" : "Continue"}
            </Button>
          ) : (
            <Button
              size="lg"
              fullWidth
              disabled={!otp.every((d) => d) || isSuccess}
              onClick={handleOtpSubmit}
              className={`h-13 rounded-2xl font-bold text-base shadow-md cursor-pointer transition-all ${
                isSuccess
                  ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                  : ""
              }`}
            >
              {isSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <IconCheck size={20} stroke={3} />
                  <span>
                    {lang === "ar"
                      ? "تم التحقق وتحديث الرقم!"
                      : "Verified & Updated!"}
                  </span>
                </span>
              ) : lang === "ar" ? (
                "تأكيد التغيير"
              ) : (
                "Confirm Change"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
