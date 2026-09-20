import { useRef, useState, ReactNode } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import ScreenShot from "./ScreenShot"
import { Theme } from "../theme"
import {
  SplashScreen,
  SignupScreen,
  OtpScreen,
  HomeScreen,
  MapScreenStatic,
  ShopDetailScreen,
  BookingStep1Screen,
  BookingStep2Screen,
  BookingStep2CashScreen,
  QueueInQueueScreen,
  QueueNextUpScreen,
  ProfileScreen,
  LanguageModalScreen,
  FavoritesScreen,
} from "./StaticScreens"
type ExportTheme = "dark" | "light" | "both"

const SCREENS: Array<{
  label: string
  labelAr: string
  render: (theme: Theme) => ReactNode
}> = [
  {
    label: "01 · Splash",
    labelAr: "الترحيب",
    render: (t) => <SplashScreen theme={t} />,
  },
  {
    label: "02 · Sign Up",
    labelAr: "إنشاء حساب",
    render: (t) => <SignupScreen theme={t} />,
  },
  {
    label: "03 · OTP",
    labelAr: "رمز التحقق",
    render: (t) => <OtpScreen theme={t} />,
  },
  {
    label: "04 · Home",
    labelAr: "الرئيسية",
    render: (t) => <HomeScreen theme={t} />,
  },
  {
    label: "05 · Map",
    labelAr: "الخريطة",
    render: (t) => <MapScreenStatic theme={t} />,
  },
  {
    label: "06 · Shop Detail",
    labelAr: "صفحة المحل",
    render: (t) => <ShopDetailScreen theme={t} />,
  },
  {
    label: "07 · Choose Barber",
    labelAr: "اختر الحلاق",
    render: (t) => <BookingStep1Screen theme={t} />,
  },
  {
    label: "08 · Confirm Booking",
    labelAr: "تأكيد الحجز",
    render: (t) => <BookingStep2Screen theme={t} />,
  },
  {
    label: "08b · Confirm — Cash",
    labelAr: "تأكيد — دفع نقدي",
    render: (t) => <BookingStep2CashScreen theme={t} />,
  },
  {
    label: "09 · Queue — Waiting",
    labelAr: "الطابور — انتظار",
    render: (t) => <QueueInQueueScreen theme={t} />,
  },
  {
    label: "10 · Queue — You're Next",
    labelAr: "الطابور — أنت التالي",
    render: (t) => <QueueNextUpScreen theme={t} />,
  },
  {
    label: "11 · Profile",
    labelAr: "الملف الشخصي",
    render: (t) => <ProfileScreen theme={t} />,
  },
  {
    label: "12 · Language Drawer",
    labelAr: "نافذة اختيار اللغة",
    render: (t) => <LanguageModalScreen theme={t} />,
  },
  {
    label: "13 · Favorites",
    labelAr: "قائمة المفضلة",
    render: (t) => <FavoritesScreen theme={t} />,
  },
]

interface Props {
  onBack: () => void
}

export default function ExportPage({ onBack }: Props) {
  const screenRefs = useRef<(HTMLDivElement | null)[]>([])
  const [exporting, setExporting] = useState(false)
  const [exportTheme, setExportTheme] = useState<ExportTheme>("dark")
  const [progress, setProgress] = useState<number | null>(null)

  const exportPDF = async () => {
    if (exporting) return
    setExporting(true)
    setProgress(0)

    try {
      // A4 portrait in mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      const PW = pdf.internal.pageSize.getWidth() // 210
      const PH = pdf.internal.pageSize.getHeight() // 297

      const themes: Array<"dark" | "light"> =
        exportTheme === "both" ? ["dark", "light"] : [exportTheme]

      let pageIndex = 0

      for (const t of themes) {
        const pageBg = t === "dark" ? "#080706" : "#f0ece4"

        for (let i = 0; i < SCREENS.length; i++) {
          const el =
            screenRefs.current[i + (t === "light" ? SCREENS.length : 0)]
          if (!el) continue

          setProgress(
            Math.round((pageIndex / (SCREENS.length * themes.length)) * 100),
          )

          const canvas = await html2canvas(el, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: pageBg,
            logging: false,
          })

          if (pageIndex > 0) pdf.addPage()

          const imgData = canvas.toDataURL("image/png")

          // Phone frame centered with padding + label area at bottom
          const MARGIN = 16
          const LABEL_H = 18
          const availH = PH - MARGIN * 2 - LABEL_H
          const availW = PW - MARGIN * 2
          const aspect = canvas.width / canvas.height
          let imgW = availW
          let imgH = imgW / aspect
          if (imgH > availH) {
            imgH = availH
            imgW = imgH * aspect
          }
          const x = (PW - imgW) / 2
          const y = MARGIN + (availH - imgH) / 2

          // Page background
          pdf.setFillColor(pageBg)
          pdf.rect(0, 0, PW, PH, "F")

          pdf.addImage(imgData, "PNG", x, y, imgW, imgH)

          // Bottom label
          const [lr, lg, lb] = t === "dark" ? [106, 101, 96] : [138, 128, 120]
          pdf.setFontSize(8)
          pdf.setTextColor(lr, lg, lb)
          const sc = SCREENS[i]
          pdf.text(
            `${sc.label}  ·  ${sc.labelAr}  ·  ${
              t === "dark" ? "Dark" : "Light"
            }`,
            PW / 2,
            PH - MARGIN / 2,
            { align: "center" },
          )

          pageIndex++
        }
      }

      setProgress(100)
      pdf.save("حلاقين-app-screens.pdf")
    } finally {
      setExporting(false)
      setTimeout(() => setProgress(null), 1500)
    }
  }

  const previewVariants: Array<"dark" | "light"> =
    exportTheme === "both" ? ["dark", "light"] : [exportTheme]

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#080706",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      {/* Sticky toolbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(8,7,6,0.96)",
          borderBottom: "1px solid #2a2720",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "7px 16px",
            borderRadius: 10,
            backgroundColor: "#1a1916",
            color: "#f0ece4",
            fontSize: 12,
            fontWeight: 600,
            border: "1px solid #2a2720",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ← رجوع
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#6a6560" }}>الثيم:</span>
          {(["dark", "light", "both"] as ExportTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => setExportTheme(t)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                backgroundColor: exportTheme === t ? "#c8922a" : "#1a1916",
                color: exportTheme === t ? "#0f0e0d" : "#6a6560",
              }}
            >
              {{ dark: "🌙 داكن", light: "☀️ فاتح", both: "الاثنان" }[t]}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {progress !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 100,
                  height: 4,
                  borderRadius: 99,
                  backgroundColor: "#2a2720",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: "#c8922a",
                    borderRadius: 99,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#c8922a" }}>
                {progress}%
              </span>
            </div>
          )}
          <button
            onClick={exportPDF}
            disabled={exporting}
            style={{
              padding: "9px 20px",
              borderRadius: 12,
              backgroundColor: exporting ? "#6a6560" : "#c8922a",
              color: "#0f0e0d",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: exporting ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {exporting
              ? "⏳ جارٍ..."
              : `⬇️ PDF (${SCREENS.length * (exportTheme === "both" ? 2 : 1)} صفحة)`}
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "28px 40px 16px", direction: "rtl" }}>
        <p
          style={{
            fontSize: 10,
            color: "#6a6560",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Customer App · شاشات المستخدم
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "#f0ece4",
            fontSize: 28,
            fontWeight: 300,
          }}
        >
          تطبيق <em>حلاقين</em>
        </h1>
        <p style={{ color: "#6a6560", fontSize: 11, marginTop: 4 }}>
          {SCREENS.length} شاشة · كل شاشة في صفحة A4 مستقلة
        </p>
      </div>

      {/* Preview grid */}
      <div
        style={{
          padding: "8px 32px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {previewVariants.map((variant) => (
          <div key={variant}>
            <p
              style={{
                fontSize: 10,
                color: "#6a6560",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 16,
                paddingLeft: 8,
              }}
            >
              {variant === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 24,
              }}
            >
              {SCREENS.map((sc, i) => (
                <div
                  key={`preview-${variant}-${i}`}
                  ref={(el) => {
                    screenRefs.current[
                      i + (variant === "light" ? SCREENS.length : 0)
                    ] = el
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: variant === "dark" ? "#0c0b0a" : "#f0ece4",
                    borderRadius: 16,
                    border: `1px solid ${
                      variant === "dark" ? "#2a2720" : "#d8d0c4"
                    }`,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ScreenShot
                    label={`${sc.label} · ${sc.labelAr}`}
                    variant={variant}
                  >
                    {sc.render(variant)}
                  </ScreenShot>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
