import { useState } from "react"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Input, Card, Badge, BackButton } from "@/components/ui"
import { IconScissors } from "@tabler/icons-react"

interface Props {
  theme: Theme
  lang: Lang
  onDone: () => void
}

type Step = "splash" | "login" | "signup" | "otp"

export default function Auth({ theme, lang, onDone }: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const [step, setStep] = useState<Step>("splash")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [flow, setFlow] = useState<"login" | "signup">("login")

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 3) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
    if (next.every((d) => d !== "")) {
      setTimeout(onDone, 400)
    }
  }

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[i] && i > 0) {
        document.getElementById(`otp-${i - 1}`)?.focus()
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    } else if (e.key === "ArrowRight" && i < 3) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4)
    if (pasted) {
      const next = [...otp]
      for (let i = 0; i < 4; i++) {
        next[i] = pasted[i] || ""
      }
      setOtp(next)
      const nextFocus = Math.min(pasted.length, 3)
      document.getElementById(`otp-${nextFocus}`)?.focus()
      if (pasted.length === 4) {
        setTimeout(onDone, 400)
      }
    }
  }

  if (step === "splash") {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
        <div className="flex-1 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=900&fit=crop&auto=format"
            alt="barbershop"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${C.bg} 18%, rgba(0,0,0,0.1) 60%)`,
            }}
          />
          {/*<div className="absolute top-14 left-0 right-0 flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
              style={{ backgroundColor: C.gold }}
            >
              <IconScissors size={28} stroke={2.2} className="text-stone-950" />
            </div>
            <p
              className="text-2xl font-light tracking-widest text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              حلاقين
            </p>
          </div>*/}
        </div>
        <div className="px-6 pt-6 pb-10 space-y-3" dir={dir}>
          <h2
            className="text-3xl font-light mb-1"
            style={{ fontFamily: "var(--font-display)", color: C.text }}
          >
            {T.splashTitle}
            <br />
            <em>{T.splashSub}</em>
          </h2>
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ color: C.muted }}
          >
            {T.splashDesc}
          </p>
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              setFlow("signup")
              setStep("signup")
            }}
          >
            {T.createAccount}
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => {
              setFlow("login")
              setStep("login")
            }}
          >
            {T.login}
          </Button>
        </div>
      </div>
    )
  }

  if (step === "login" || step === "signup") {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
        <div className="px-5 pt-14 pb-5" dir={dir}>
          <BackButton
            variant="ghost"
            dir={dir}
            onClick={() => setStep("splash")}
            className="mb-5 text-[var(--muted-foreground)]"
            iconSize={20}
          />
          <h2
            className="text-2xl font-light"
            style={{ fontFamily: "var(--font-display)", color: C.text }}
          >
            {step === "signup" ? T.createAccountTitle : T.welcomeBack}
          </h2>
          <p className="text-sm mt-1" style={{ color: C.muted }}>
            {step === "signup" ? T.phoneHint : T.phoneHintLogin}
          </p>
        </div>
        <div className="flex-1 px-5 space-y-4" dir={dir}>
          {step === "signup" && (
            <div className="space-y-1.5">
              <label
                className="text-xs tracking-widest uppercase font-medium"
                style={{ color: C.muted }}
              >
                {T.fullName}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد القمودي"
                dir="rtl"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label
              className="text-xs tracking-widest uppercase font-medium"
              style={{ color: C.muted }}
            >
              {T.phone}
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="91 234 5678"
              inputMode="numeric"
              maxLength={10}
              dir="ltr"
              className="text-left font-medium"
              startIcon={
                <div className="flex items-center gap-1.5 pr-2.5 mr-2 border-r border-[var(--border)] select-none">
                  <span className="text-base leading-none">🇱🇾</span>
                  <span className="text-xs font-semibold text-[var(--foreground)] tracking-tight">
                    +218
                  </span>
                </div>
              }
            />
          </div>
          {step === "signup" && (
            <Card className="p-3.5 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/10 rounded-2xl">
              <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                {T.termsNote}
              </p>
            </Card>
          )}
        </div>
        <div className="px-5 py-6" dir={dir}>
          <Button
            size="lg"
            fullWidth
            disabled={phone.length < 9}
            onClick={() => {
              if (phone.length >= 9) {
                setOtp(["", "", "", ""])
                setStep("otp")
                setTimeout(() => {
                  document.getElementById("otp-0")?.focus()
                }, 100)
              }
            }}
          >
            {T.sendOtp}
          </Button>
          <p
            className="text-center text-xs mt-4 flex items-center justify-center gap-1.5"
            style={{ color: C.muted }}
          >
            <span>{step === "signup" ? T.hasAccount : T.noAccount}</span>
            <Button
              variant="link"
              onClick={() => setStep(step === "signup" ? "login" : "signup")}
              className="text-xs font-semibold text-[var(--primary)]"
            >
              {step === "signup" ? T.login : T.createAccount}
            </Button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      <div className="px-5 pt-14 pb-5" dir={dir}>
        <BackButton
          variant="ghost"
          dir={dir}
          onClick={() => setStep(flow)}
          className="mb-5 text-[var(--muted-foreground)]"
          iconSize={20}
        />
        <h2
          className="text-2xl font-light"
          style={{ fontFamily: "var(--font-display)", color: C.text }}
        >
          {T.otpTitle}
        </h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: C.muted }}>
          {T.otpSentTo}
          <br />
          <span
            dir="ltr"
            className="font-semibold inline-block"
            style={{ color: C.text }}
          >
            +218 {phone}
          </span>
        </p>
      </div>
      <div className="flex-1 px-5 flex flex-col items-center pt-8 space-y-8">
        <div className="flex gap-3 justify-center" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              value={digit}
              dir="ltr"
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              onPaste={handleOtpPaste}
              className="w-14 h-14 text-center text-xl font-semibold rounded-2xl outline-none transition-all border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
              inputMode="numeric"
              maxLength={1}
              autoComplete={i === 0 ? "one-time-code" : "off"}
            />
          ))}
        </div>
        <p
          className="text-xs text-center flex items-center justify-center gap-1.5"
          style={{ color: C.muted }}
        >
          <span>{T.otpNotArrived}</span>
          <Button
            variant="link"
            className="text-xs font-semibold text-[var(--primary)]"
            onClick={() => {
              setOtp(["", "", "", ""])
              setTimeout(() => {
                document.getElementById("otp-0")?.focus()
              }, 50)
            }}
          >
            {T.resend}
          </Button>
        </p>
        <div className="w-full px-5">
          <Button
            size="lg"
            fullWidth
            disabled={!otp.every((d) => d)}
            onClick={() => otp.every((d) => d) && onDone()}
          >
            {T.confirmEntry}
          </Button>
        </div>
      </div>
    </div>
  )
}
