// Static, non-interactive versions of every app screen for PDF export.
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { SHOPS, MY_BOOKING } from "../data"

export interface ScreenProps {
  theme?: Theme
  lang?: Lang
}

function getS(C: ReturnType<typeof getC>) {
  return {
    label: {
      fontSize: 10,
      color: C.muted,
      textTransform: "uppercase" as const,
      fontFamily: "'Cairo', sans-serif",
      letterSpacing: "normal",
    },
    h1: {
      fontFamily: "'Cairo', sans-serif",
      color: C.text,
      fontSize: 26,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: "'Cairo', sans-serif",
      color: C.text,
      fontSize: 20,
      fontWeight: 700,
    },
    card: {
      backgroundColor: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
    },
    gold: { color: C.gold },
    muted: { color: C.muted, fontSize: 13, fontFamily: "'Cairo', sans-serif" },
    body: { fontFamily: "'Cairo', sans-serif", color: C.text, fontSize: 13 },
    pill: (active: boolean) => ({
      padding: "6px 16px",
      borderRadius: 99,
      fontSize: 12,
      fontFamily: "'Cairo', sans-serif",
      backgroundColor: active ? C.gold : C.card,
      color: active ? "#0f0e0d" : C.muted,
      border: `1px solid ${active ? C.gold : C.border}`,
      fontWeight: active ? 600 : 400,
    }),
  }
}

// ─── AUTH: SPLASH ─────────────────────────────────────────────────────────────
export function SplashScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=900&fit=crop&auto=format"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, ${C.bg} 18%, rgba(0,0,0,0.1) 60%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: C.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginBottom: 12,
            }}
          >
            ✂️
          </div>
          <p style={{ ...S.h2, fontSize: 24, letterSpacing: "0.2em" }}>
            حلاقين
          </p>
        </div>
      </div>
      <div
        style={{
          padding: "24px 24px 40px",
          gap: 12,
          display: "flex",
          flexDirection: "column",
          direction: "rtl",
        }}
      >
        <h2 style={{ ...S.h1, marginBottom: 4 }}>
          احجز دورك،
          <br />
          <em>بدون انتظار مجهول.</em>
        </h2>
        <p style={{ ...S.muted, lineHeight: 1.6 }}>
          تابع طابور الحلاق في الوقت الفعلي، واحجز دورك من مكانك.
        </p>
        <div
          style={{
            height: 48,
            borderRadius: 18,
            backgroundColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0f0e0d",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}
          >
            إنشاء حساب جديد
          </span>
        </div>
        <div
          style={{
            height: 46,
            borderRadius: 18,
            border: `1px solid ${C.border}`,
            backgroundColor: C.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: C.text,
              fontSize: 13,
              fontFamily: "var(--font-body)",
            }}
          >
            تسجيل الدخول
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── AUTH: SIGNUP ─────────────────────────────────────────────────────────────
export function SignupScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "56px 20px 20px", direction: "rtl" }}>
        <div style={{ marginBottom: 20, color: C.muted, fontSize: 20 }}>←</div>
        <h2 style={S.h2}>إنشاء حساب</h2>
        <p style={{ ...S.muted, marginTop: 4 }}>سجّل رقم هاتفك للبدء</p>
      </div>
      <div
        style={{
          flex: 1,
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          direction: "rtl",
        }}
      >
        <div>
          <p style={{ ...S.label, marginBottom: 6 }}>الاسم الكامل</p>
          <div style={{ ...S.card, padding: "14px 16px" }}>
            <span style={S.body}>محمد القمودي</span>
          </div>
        </div>
        <div>
          <p style={{ ...S.label, marginBottom: 6 }}>رقم الهاتف</p>
          <div
            style={{
              ...S.card,
              padding: "14px 16px",
              display: "flex",
              gap: 12,
              direction: "ltr",
              alignItems: "center",
            }}
          >
            <span style={{ ...S.body, color: C.text, fontWeight: 600 }}>
              🇱🇾 +218
            </span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ ...S.body, color: C.text, fontWeight: 500 }}>
              91 234 5678
            </span>
          </div>
        </div>
        <div
          style={{
            borderRadius: 12,
            padding: "12px 16px",
            backgroundColor: `${C.gold}12`,
            border: `1px solid ${C.gold}28`,
          }}
        >
          <span style={{ ...S.muted, fontSize: 11 }}>
            بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية.
          </span>
        </div>
      </div>
      <div style={{ padding: "0 20px 40px" }}>
        <div
          style={{
            height: 50,
            borderRadius: 18,
            backgroundColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0f0e0d",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            إرسال رمز التحقق
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── AUTH: OTP ────────────────────────────────────────────────────────────────
export function OtpScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "56px 20px 20px", direction: "rtl" }}>
        <div style={{ marginBottom: 20, color: C.muted, fontSize: 20 }}>←</div>
        <h2 style={S.h2}>رمز التحقق</h2>
        <p style={{ ...S.muted, marginTop: 4, lineHeight: 1.7 }}>
          أُرسل رمز مكوّن من 4 أرقام إلى
          <br />
          <span
            dir="ltr"
            style={{ color: C.text, display: "inline-block", fontWeight: 600 }}
          >
            +218 91 234 5678
          </span>
        </p>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 32,
          gap: 32,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {["3", "7", "", ""].map((d, i) => (
            <div
              key={i}
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: d ? `${C.gold}18` : C.card,
                border: `1.5px solid ${d ? C.gold : C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 600, color: C.text }}>
                {d}
              </span>
            </div>
          ))}
        </div>
        <p style={{ ...S.muted }}>
          لم يصل الرمز؟ <span style={{ color: C.gold }}>إعادة الإرسال</span>
        </p>
        <div
          style={{
            width: "calc(100% - 40px)",
            height: 50,
            borderRadius: 18,
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ ...S.muted }}>تأكيد الدخول</span>
        </div>
      </div>
    </div>
  )
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
export function HomeScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  const shop = SHOPS[0]
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "48px 20px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
            direction: "rtl",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 99,
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...S.label }}>طرابلس، ليبيا</p>
            <h1 style={{ ...S.h1, fontSize: 22 }}>حلاقين قريبين</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#f43f5e",
              }}
            >
              ❤️
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🔔
            </div>
          </div>
        </div>
        <div
          style={{
            ...S.card,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            marginTop: 14,
          }}
        >
          <span style={{ color: C.muted }}>🔍</span>
          <span style={{ ...S.muted }}>ابحث عن حلاق...</span>
        </div>
      </div>
      <div
        style={{
          padding: "0 20px 12px",
          display: "flex",
          gap: 8,
          direction: "rtl",
        }}
      >
        {["حلاقين", "صالونات", "صالة حديد"].map((cat, i) => (
          <div key={cat} style={{ ...S.pill(i === 0) }}>
            {cat}
          </div>
        ))}
      </div>
      {/* Active booking banner */}
      <div style={{ margin: "0 20px 12px" }}>
        <div
          style={{
            borderRadius: 18,
            padding: "12px 16px",
            backgroundColor: `${C.gold}18`,
            border: `1.5px solid ${C.gold}50`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            direction: "rtl",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: C.gold,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}
          >
            عرض الطابور ›
          </span>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...S.body, fontSize: 12, fontWeight: 600 }}>
              حجز نشط — Royal Cut
            </p>
            <p style={{ ...S.muted, fontSize: 11 }}>الموقع #2</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "hidden", padding: "0 20px" }}>
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
            backgroundColor: C.card,
          }}
        >
          <div
            style={{
              position: "relative",
              height: 120,
              backgroundColor: C.cardAlt,
            }}
          >
            <img
              src={shop.photo}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 99,
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  backgroundColor: C.green,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: C.green,
                  fontFamily: "var(--font-body)",
                }}
              >
                مفتوح
              </span>
            </div>
            <div style={{ position: "absolute", bottom: 10, right: 10 }}>
              <span style={{ fontSize: 11, color: "#f0ece4" }}>
                ⏱ 3 شخص ينتظر
              </span>
            </div>
          </div>
          <div style={{ padding: "10px 14px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                direction: "rtl",
              }}
            >
              <span style={{ fontSize: 11, color: C.muted }}>★ 4.8 (124)</span>
              <span style={{ ...S.body, fontWeight: 500 }}>رويال كت ✓</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 4,
                direction: "rtl",
              }}
            >
              <span style={{ fontSize: 11, color: C.muted }}>0.4 كم</span>
              <span style={{ fontSize: 11, color: C.muted }}>
                شارع الجمهورية
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAP (Tripoli City Map) ────────────────────────────────────────────────────
export function MapScreenStatic({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  const isDark = theme === "dark"

  const seaBg = isDark ? "#0f2330" : "#d2e6f5"
  const mapBg = isDark ? "#161b20" : "#eaedee"
  const roadColor = isDark ? "#283138" : "#ffffff"
  const roadBorder = isDark ? "#1e262c" : "#d8dcde"
  const textSub = isDark ? "#5a6872" : "#7a8892"

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "48px 20px 12px", direction: "rtl" }}>
        <p style={S.label}>الخريطة</p>
        <h1 style={{ ...S.h1, fontSize: 22 }}>حلاقين قريبين — طرابلس</h1>
      </div>

      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          backgroundColor: mapBg,
        }}
      >
        {/* SVG Tripoli Map Graphic */}
        <svg
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
          }}
        >
          {/* Mediterranean Sea (Top portion of Tripoli coast) */}
          <path
            d="M 0 0 L 390 0 L 390 130 Q 280 150 200 135 T 0 110 Z"
            fill={seaBg}
          />

          {/* Shoreline stroke */}
          <path
            d="M 0 110 Q 200 135 200 135 Q 280 150 390 130"
            fill="none"
            stroke={isDark ? "#2c4858" : "#a2c4d8"}
            strokeWidth="3"
          />

          {/* Road Network - Tripoli coastal road (طريق الشط) */}
          <path
            d="M 0 120 Q 180 142 390 138"
            fill="none"
            stroke={roadColor}
            strokeWidth="10"
          />
          <path
            d="M 0 120 Q 180 142 390 138"
            fill="none"
            stroke={roadBorder}
            strokeWidth="1"
          />

          {/* Primary Artery - Al Jumhuriya St (شارع الجمهورية) */}
          <path
            d="M 120 130 L 210 260 L 320 380"
            fill="none"
            stroke={roadColor}
            strokeWidth="8"
          />

          {/* Hay Andalus Main St */}
          <path
            d="M 40 120 L 90 280 L 150 400"
            fill="none"
            stroke={roadColor}
            strokeWidth="7"
          />

          {/* Airport Road (طريق المطار) */}
          <path
            d="M 210 260 L 260 480"
            fill="none"
            stroke={roadColor}
            strokeWidth="9"
          />

          {/* Ring Roads */}
          <path
            d="M 20 220 C 120 250, 240 240, 370 290"
            fill="none"
            stroke={roadColor}
            strokeWidth="6"
          />
          <path
            d="M 10 320 C 130 350, 260 360, 380 390"
            fill="none"
            stroke={roadColor}
            strokeWidth="6"
          />

          {/* Secondary Street Grid */}
          <path
            d="M 80 180 L 280 180"
            fill="none"
            stroke={roadColor}
            strokeWidth="4"
          />
          <path
            d="M 100 220 L 300 220"
            fill="none"
            stroke={roadColor}
            strokeWidth="4"
          />
          <path
            d="M 140 150 L 140 310"
            fill="none"
            stroke={roadColor}
            strokeWidth="4"
          />
          <path
            d="M 270 180 L 270 340"
            fill="none"
            stroke={roadColor}
            strokeWidth="4"
          />
        </svg>

        {/* District & Location Labels */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 110,
            fontSize: 11,
            color: isDark ? "#4a7a90" : "#4a7895",
            fontWeight: 600,
          }}
        >
          البحر الأبيض المتوسط
        </div>
        <div
          style={{
            position: "absolute",
            top: 105,
            left: 160,
            fontSize: 9,
            color: textSub,
            transform: "rotate(3deg)",
          }}
        >
          طريق الشط
        </div>
        <div
          style={{
            position: "absolute",
            top: 175,
            left: 40,
            fontSize: 10,
            color: textSub,
            fontWeight: 600,
          }}
        >
          حي الأندلس
        </div>
        <div
          style={{
            position: "absolute",
            top: 155,
            left: 195,
            fontSize: 10,
            color: textSub,
            fontWeight: 600,
          }}
        >
          طرابلس المركز
        </div>
        <div
          style={{
            position: "absolute",
            top: 225,
            left: 180,
            fontSize: 9,
            color: textSub,
            transform: "rotate(50deg)",
          }}
        >
          شارع الجمهورية
        </div>
        <div
          style={{
            position: "absolute",
            top: 310,
            left: 245,
            fontSize: 9,
            color: textSub,
            transform: "rotate(75deg)",
          }}
        >
          طريق المطار
        </div>

        {/* Pins */}
        {/* Pin 1: Royal Cut on Al-Jumhuriya St (Active / Selected) */}
        <div
          style={{
            position: "absolute",
            top: 210,
            left: 200,
            transform: "translate(-50%, -100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "3px 8px",
              borderRadius: 8,
              backgroundColor: C.gold,
              color: "#0f0e0d",
              fontSize: 10,
              fontWeight: 700,
              marginBottom: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            رويال كت ★ 4.8
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              backgroundColor: C.gold,
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 18px ${C.gold}90`,
              border: "2px solid #ffffff",
            }}
          >
            <span style={{ transform: "rotate(45deg)", fontSize: 16 }}>✂️</span>
          </div>
        </div>

        {/* Pin 2: Classic Barber in Hay Andalus (Open) */}
        <div
          style={{
            position: "absolute",
            top: 190,
            left: 75,
            transform: "translate(-50%, -100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              backgroundColor: "#4a8a5a",
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              border: "2px solid #ffffff80",
            }}
          >
            <span style={{ transform: "rotate(45deg)", fontSize: 13 }}>✂️</span>
          </div>
        </div>

        {/* Pin 3: Fade Studio on Airport Rd (Closed) */}
        <div
          style={{
            position: "absolute",
            top: 320,
            left: 255,
            transform: "translate(-50%, -100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              backgroundColor: "#6a6560",
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              border: "2px solid #ffffff80",
            }}
          >
            <span style={{ transform: "rotate(45deg)", fontSize: 13 }}>✂️</span>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: isDark
              ? "rgba(22,27,32,0.92)"
              : "rgba(255,255,255,0.92)",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              direction: "rtl",
            }}
          >
            <span style={{ fontSize: 11, color: C.muted }}>مفتوح</span>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                backgroundColor: "#4a8a5a",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              direction: "rtl",
            }}
          >
            <span style={{ fontSize: 11, color: C.muted }}>مغلق</span>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                backgroundColor: "#6a6560",
              }}
            />
          </div>
        </div>

        {/* Selected shop card overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 30,
          }}
        >
          <div
            style={{
              margin: "0 12px 12px",
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{ height: 80, position: "relative", overflow: "hidden" }}
            >
              <img
                src={SHOPS[0].photo}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 12,
                  left: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  direction: "rtl",
                }}
              >
                <span style={{ fontSize: 10, color: "rgba(240,236,228,0.8)" }}>
                  ★ 4.8 (124)
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "#f0ece4",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  رويال كت ✓
                </span>
              </div>
            </div>
            <div
              style={{
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                direction: "rtl",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  direction: "rtl",
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: C.green, fontWeight: 500 }}>
                    3 ينتظر
                  </p>
                  <p style={{ fontSize: 10, color: C.muted }}>
                    شارع الجمهورية، طرابلس
                  </p>
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    backgroundColor: C.green,
                  }}
                />
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  backgroundColor: C.gold,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#0f0e0d",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  عرض المحل
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SHOP DETAIL ──────────────────────────────────────────────────────────────
export function ShopDetailScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  const shop = SHOPS[0]
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", height: 180, flexShrink: 0 }}>
        <img
          src={shop.photo}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, ${C.bg} 0%, rgba(0,0,0,0.2) 60%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 99,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#f0ece4" }}>←</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 16,
            left: 16,
            direction: "rtl",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <span style={{ fontSize: 11, color: C.gold }}>★ 4.8 (124)</span>
            <div>
              <div
                style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    fontFamily: "var(--font-display)",
                    color: "#f0ece4",
                    fontWeight: 300,
                  }}
                >
                  رويال كت
                </h2>
                <span style={{ color: C.gold }}>✓</span>
              </div>
              <p style={{ fontSize: 10, color: "rgba(240,236,228,0.6)" }}>
                شارع الجمهورية، طرابلس
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "10px 20px",
          backgroundColor: C.card,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.muted }}>⏱ انتظار تقريبي</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
            ~25 دقيقة
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              backgroundColor: C.green,
            }}
          />
          <span style={{ fontSize: 13, color: C.green, fontWeight: 500 }}>
            مفتوح • 3 ينتظر
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "12px 20px 0",
          borderBottom: `1px solid ${C.border}`,
          direction: "rtl",
        }}
      >
        {["الخدمات", "الحلاقون", "الصور", "التقييمات"].map((t, i) => (
          <div
            key={t}
            style={{
              paddingBottom: 10,
              fontSize: 13,
              fontWeight: 500,
              color: i === 0 ? C.gold : C.muted,
              borderBottom:
                i === 0 ? `2px solid ${C.gold}` : "2px solid transparent",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "hidden",
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          direction: "rtl",
        }}
      >
        {shop.services.slice(0, 4).map((sv, i) => (
          <div
            key={sv.id}
            style={{
              ...S.card,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: i === 2 ? `${C.gold}18` : C.card,
              border: `1px solid ${i === 2 ? C.gold : C.border}`,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.muted }}>
                {sv.duration} د
              </span>
              {i === 2 && (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 99,
                    backgroundColor: C.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#0f0e0d",
                  }}
                >
                  ✓
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ ...S.body, fontWeight: 500 }}>{sv.name}</p>
              <p style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>
                {sv.price} د.ل
              </p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            height: 50,
            borderRadius: 18,
            backgroundColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0f0e0d",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            احجز الآن
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── BOOKING STEP 1 ───────────────────────────────────────────────────────────
export function BookingStep1Screen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  const shop = SHOPS[0]
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "48px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{ color: C.muted }}>←</span>
        <div style={{ flex: 1, direction: "rtl" }}>
          <h2
            style={{
              fontSize: 18,
              fontFamily: "var(--font-display)",
              color: C.text,
              fontWeight: 300,
            }}
          >
            اختر الحلاق
          </h2>
          <p style={{ fontSize: 11, color: C.muted }}>رويال كت · شعر + لحية</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 6,
              borderRadius: 99,
              backgroundColor: C.gold,
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              backgroundColor: C.border,
            }}
          />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          direction: "rtl",
          overflowY: "hidden",
        }}
      >
        <p style={{ ...S.label }}>أي حلاق تفضل؟</p>
        <div
          style={{
            ...S.card,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: C.muted }}>أقل انتظار</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...S.body, fontWeight: 500, fontSize: 12 }}>
              أي حلاق متاح
            </p>
            <p style={{ fontSize: 10, color: C.muted }}>سيُعيَّن تلقائياً</p>
          </div>
        </div>
        {shop.staff.map((st, i) => (
          <div
            key={st.id}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: st.altBooking
                ? C.card
                : i === 0
                  ? `${C.gold}18`
                  : C.card,
              border: `1px solid ${
                st.altBooking ? C.red + "60" : i === 0 ? C.gold : C.border
              }`,
            }}
          >
            {/* Alt booking chip */}
            {st.altBooking && (
              <div style={{ padding: "8px 14px 4px", direction: "rtl" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: 10,
                    backgroundColor: `${C.red}12`,
                    border: `1px solid ${C.red}25`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.red,
                        fontFamily: "var(--font-body)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      04:59
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        padding: "3px 8px",
                        borderRadius: 99,
                        backgroundColor: C.red,
                        color: "#fff",
                        fontWeight: 700,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      خذ الدور — {st.altBooking.fee} د.ل
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: C.red,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      ⚡ دور بديل متاح
                    </p>
                    <p style={{ fontSize: 9, color: C.muted }}>
                      الزبون لم يؤكد حضوره
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Barber row */}
            <div
              style={{
                padding: "10px 14px",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {i === 0 && !st.altBooking && (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 99,
                      backgroundColor: C.gold,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#0f0e0d",
                    }}
                  >
                    ✓
                  </div>
                )}
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 10, color: C.muted }}>
                    {st.queue} ينتظر
                  </span>
                  <p style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>
                    ~{st.avgWait} د
                  </p>
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <p style={{ ...S.body, fontWeight: 500, fontSize: 12 }}>
                  {st.name}
                </p>
                <p style={{ fontSize: 10, color: C.gold }}>★ {st.rating}</p>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={st.photo}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <div
          style={{
            height: 46,
            borderRadius: 18,
            backgroundColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0f0e0d",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            التالي
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── BOOKING STEP 2 ───────────────────────────────────────────────────────────
export function BookingStep2Screen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "48px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{ color: C.muted }}>←</span>
        <div style={{ flex: 1, direction: "rtl" }}>
          <h2
            style={{
              fontSize: 18,
              fontFamily: "var(--font-display)",
              color: C.text,
              fontWeight: 300,
            }}
          >
            تأكيد الحجز
          </h2>
          <p style={{ fontSize: 11, color: C.muted }}>رويال كت · شعر + لحية</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 6,
              borderRadius: 99,
              backgroundColor: C.gold,
            }}
          />
          <div
            style={{
              width: 16,
              height: 6,
              borderRadius: 99,
              backgroundColor: C.gold,
            }}
          />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          direction: "rtl",
        }}
      >
        <div style={{ ...S.card, padding: "14px 16px" }}>
          <p style={{ ...S.label, marginBottom: 12 }}>ملخص الحجز</p>
          {[
            ["المحل", "رويال كت"],
            ["الخدمة", "شعر + لحية — 22 د.ل"],
            ["الحلاق", "محمد الزروق"],
            ["وقت الانتظار", "~28 دقيقة"],
            ["موقعك في الطابور", "#3"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span style={{ ...S.body }}>{v}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{k}</span>
            </div>
          ))}
        </div>
        <div>
          <p style={{ ...S.label, marginBottom: 10 }}>طريقة الدفع</p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 18,
                backgroundColor: `${C.gold}18`,
                border: `1px solid ${C.gold}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 20 }}>💳</span>
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 500 }}>
                المحفظة
              </span>
              <span style={{ fontSize: 10, color: C.muted }}>
                الرصيد: 48 د.ل
              </span>
            </div>
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 18,
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 20 }}>💵</span>
              <span style={{ fontSize: 12, color: C.muted }}>
                نقداً في المحل
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            backgroundColor: `${C.gold}0f`,
            border: `1px solid ${C.gold}22`,
          }}
        >
          <span style={{ fontSize: 11, color: C.muted }}>
            ⚠️ إذا لم تؤكد حضورك خلال{" "}
            <span style={{ color: C.gold }}>10 دقائق</span> من إشعار "أنت
            التالي"، سيُلغى دورك تلقائياً.
          </span>
        </div>
      </div>
      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            height: 50,
            borderRadius: 18,
            backgroundColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0f0e0d",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            تأكيد الحجز
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── BOOKING STEP 2b — CASH WARNING ──────────────────────────────────────────
export function BookingStep2CashScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "48px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{ color: C.muted }}>←</span>
        <div style={{ flex: 1, direction: "rtl" }}>
          <h2
            style={{
              fontSize: 18,
              fontFamily: "var(--font-display)",
              color: C.text,
              fontWeight: 300,
            }}
          >
            تأكيد الحجز
          </h2>
          <p style={{ fontSize: 11, color: C.muted }}>رويال كت · شعر + لحية</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 6,
              borderRadius: 99,
              backgroundColor: C.gold,
            }}
          />
          <div
            style={{
              width: 16,
              height: 6,
              borderRadius: 99,
              backgroundColor: C.gold,
            }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          direction: "rtl",
        }}
      >
        {/* Summary */}
        <div style={{ ...S.card, padding: "14px 16px" }}>
          <p style={{ ...S.label, marginBottom: 12 }}>ملخص الحجز</p>
          {[
            ["المحل", "رويال كت"],
            ["الخدمة", "شعر + لحية — 22 د.ل"],
            ["الحلاق", "محمد الزروق"],
            ["وقت الانتظار", "~28 دقيقة"],
            ["موقعك في الطابور", "#3"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span style={{ ...S.body }}>{v}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{k}</span>
            </div>
          ))}
        </div>

        {/* Payment method — cash selected */}
        <div>
          <p style={{ ...S.label, marginBottom: 10 }}>طريقة الدفع</p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 18,
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 20 }}>💳</span>
              <span style={{ fontSize: 12, color: C.muted }}>المحفظة</span>
              <span style={{ fontSize: 10, color: C.muted }}>
                الرصيد: 48 د.ل
              </span>
            </div>
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 18,
                backgroundColor: `${C.gold}18`,
                border: `1px solid ${C.gold}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 20 }}>💵</span>
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>
                نقداً في المحل
              </span>
            </div>
          </div>
        </div>

        {/* Cash warning banner */}
        <div
          style={{
            borderRadius: 14,
            padding: "14px 16px",
            backgroundColor: `${C.red}10`,
            border: `1px solid ${C.red}35`,
            direction: "rtl",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.red,
                  marginBottom: 6,
                  fontFamily: "var(--font-body)",
                }}
              >
                تحذير — الدفع النقدي
              </p>
              <p style={{ fontSize: 11, color: C.textSub, lineHeight: 1.6 }}>
                عند اختيار الدفع نقداً يُرجى الالتزام بالحضور في وقتك، لأن{" "}
                <span style={{ color: C.red, fontWeight: 600 }}>
                  عدم الحضور يُلغي دورك
                </span>{" "}
                ويؤثر على بقية الزبائن.
              </p>
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  backgroundColor: `${C.red}15`,
                  border: `1px solid ${C.red}25`,
                }}
              >
                <p style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>
                  🔒 الدفع النقدي يعني أنه{" "}
                  <span style={{ textDecoration: "underline" }}>
                    لا يمكن تأمين دورك
                  </span>{" "}
                  — حضورك مسؤوليتك.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Presence reminder */}
        <div
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            backgroundColor: `${C.gold}0f`,
            border: `1px solid ${C.gold}22`,
          }}
        >
          <span style={{ fontSize: 11, color: C.muted }}>
            ⚠️ إذا لم تؤكد حضورك خلال{" "}
            <span style={{ color: C.gold }}>10 دقائق</span> من إشعار "أنت
            التالي"، سيُلغى دورك تلقائياً.
          </span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            height: 50,
            borderRadius: 18,
            backgroundColor: C.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            تأكيد — سأدفع نقداً
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── MY QUEUE (in_queue) ──────────────────────────────────────────────────────
export function QueueInQueueScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  const b = MY_BOOKING
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "48px 20px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `1px solid ${C.border}`,
          direction: "rtl",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 99,
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.muted,
            fontSize: 14,
          }}
        >
          ✕
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ ...S.label }}>حجزك الحالي</p>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "var(--font-display)",
              color: C.text,
              fontWeight: 300,
            }}
          >
            {b.shopName}
          </h2>
          <p style={{ fontSize: 12, color: C.muted }}>
            {b.staffName} · {b.service}
          </p>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ ...S.card, padding: "20px", direction: "rtl" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 44,
                  fontFamily: "var(--font-display)",
                  color: C.text,
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                #{b.position}
              </p>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                موقعك في الطابور
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 28, color: C.gold, fontWeight: 500 }}>
                ~{b.estimatedWait}
              </p>
              <p style={{ fontSize: 11, color: C.muted }}>دقيقة انتظار</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {Array.from({ length: b.totalAhead + 2 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 99,
                  backgroundColor:
                    i < b.position - 1
                      ? C.green
                      : i === b.position - 1
                        ? C.gold
                        : C.border,
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
            {b.position - 1} أشخاص أمامك
          </p>
        </div>
        <div
          style={{
            ...S.card,
            padding: "14px 16px",
            direction: "rtl",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[
            ["رقم الحجز", b.bookingId],
            ["طريقة الدفع", "💳 المحفظة"],
            ["الحالة", "في الطابور"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ ...S.body, fontWeight: 500 }}>{v}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MY QUEUE (next_up) ───────────────────────────────────────────────────────
export function QueueNextUpScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "48px 20px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `1px solid ${C.border}`,
          direction: "rtl",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 99,
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.muted,
            fontSize: 14,
          }}
        >
          ✕
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ ...S.label }}>حجزك الحالي</p>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "var(--font-display)",
              color: C.text,
              fontWeight: 300,
            }}
          >
            Royal Cut
          </h2>
          <p style={{ fontSize: 12, color: C.muted }}>
            محمد الزروق · شعر + لحية
          </p>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ ...S.card, padding: "20px", direction: "rtl" }}>
          <div
            style={{
              borderRadius: 16,
              padding: "16px",
              backgroundColor: `${C.gold}10`,
              border: `1px solid ${C.gold}30`,
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: C.gold,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              أنت التالي!
            </p>
            <p
              style={{
                fontSize: 42,
                fontFamily: "var(--font-display)",
                color: C.text,
                fontWeight: 300,
              }}
            >
              09:47
            </p>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              تبقى للتأكيد قبل إلغاء دورك
            </p>
          </div>
          <div
            style={{
              height: 46,
              borderRadius: 16,
              backgroundColor: C.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#0f0e0d",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
              }}
            >
              ✓ تأكيد الحضور
            </span>
          </div>
        </div>
        <div
          style={{
            ...S.card,
            padding: "14px 16px",
            direction: "rtl",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[
            ["رقم الحجز", "BK-2941"],
            ["طريقة الدفع", "💳 المحفظة"],
            ["الحالة", "أنت التالي"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ ...S.body, fontWeight: 500 }}>{v}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export function ProfileScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "48px 20px 20px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            direction: "rtl",
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, textAlign: "right" }}>
            <h2
              style={{
                fontSize: 20,
                fontFamily: "var(--font-display)",
                color: C.text,
                fontWeight: 300,
              }}
            >
              محمد القمودي
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
              +218 91 234 5678
            </p>
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 99,
              backgroundColor: C.card,
              border: `2px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            👤
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            direction: "rtl",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: "14px 16px",
              backgroundColor: `${C.gold}12`,
              border: `1px solid ${C.gold}28`,
            }}
          >
            <p style={{ ...S.label, color: C.gold, marginBottom: 4 }}>
              المحفظة
            </p>
            <p style={{ fontSize: 26, color: C.text, fontWeight: 500 }}>48</p>
            <p style={{ fontSize: 11, color: C.muted }}>دينار ليبي</p>
          </div>
          <div style={{ ...S.card, padding: "14px 16px" }}>
            <p style={{ ...S.label, marginBottom: 4 }}>النقاط</p>
            <p style={{ fontSize: 26, color: C.text, fontWeight: 500 }}>320</p>
            <p style={{ fontSize: 11, color: C.muted }}>نقطة مكافأة</p>
          </div>
        </div>
        <div
          style={{
            height: 44,
            borderRadius: 18,
            backgroundColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0f0e0d",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}
          >
            + شحن المحفظة عبر One Pay
          </span>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Visit history button container */}
        <div style={{ ...S.card, padding: "12px 16px", direction: "rtl" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📋</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                سجل الزيارات
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  backgroundColor: `${C.gold}18`,
                  color: C.gold,
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                3 زيارات
              </span>
              <span style={{ fontSize: 12, color: C.muted }}>▾</span>
            </div>
          </div>
          {[
            ["رويال كت", "شعر + لحية", 22, 5],
            ["كلاسيك باربر", "حلاقة شعر", 12, 4],
          ].map(([shop, svc, price, r], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 8,
                marginBottom: i === 0 ? 8 : 0,
                borderBottom: i === 0 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ display: "flex" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: 9,
                        color: j < (r as number) ? C.gold : C.border,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: C.gold,
                    fontWeight: 500,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {price} د.ل
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ ...S.body, fontWeight: 600, fontSize: 11 }}>
                  {shop as string}
                </p>
                <p style={{ fontSize: 9, color: C.muted }}>{svc as string}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          {[
            {
              icon: "🌙",
              label: "الوضع الليلي",
              right: theme === "dark" ? "مفعل" : "معطل",
            },
            { icon: "🌐", label: "لغة التطبيق", right: "العربية 🇱🇾 ›" },
            { icon: "📄", label: "تصدير الشاشات PDF", right: "›" },
            { icon: "🔔", label: "الإشعارات", right: "›" },
          ].map((item, i, a) => (
            <div
              key={item.label}
              style={{
                backgroundColor: C.card,
                padding: "13px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom:
                  i < a.length - 1 ? `1px solid ${C.border}` : "none",
                direction: "rtl",
              }}
            >
              <span
                style={{
                  color: C.muted,
                  fontSize: 12,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {item.right}
              </span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 13,
                    color: C.text,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {item.label}
                </span>
                <span>{item.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── LANGUAGE MODAL (Bottom Sheet) ────────────────────────────────────────────
export function LanguageModalScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dimmed Profile Background */}
      <div
        style={{
          opacity: 0.25,
          filter: "blur(2px)",
          pointerEvents: "none",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ProfileScreen theme={theme} />
      </div>

      {/* Backdrop overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      />

      {/* Bottom Sheet Drawer matching user's reference */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: C.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: `1px solid ${C.border}`,
          boxShadow: "0 -8px 30px rgba(0,0,0,0.5)",
          padding: "16px 20px 36px",
          direction: "rtl",
        }}
      >
        {/* Drag pill handle */}
        <div
          style={{
            width: 44,
            height: 4,
            borderRadius: 99,
            backgroundColor: theme === "dark" ? "#52525b" : "#cbd5e1",
            margin: "0 auto 14px",
          }}
        />

        {/* Modal Title */}
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            textAlign: "center",
            color: C.text,
            paddingBottom: 12,
            borderBottom: `1px solid ${C.border}`,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          لغة التطبيق(Language)
        </h3>

        {/* Language Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 16,
          }}
        >
          {/* Arabic Option (Selected) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 14,
              backgroundColor: `${C.gold}14`,
              border: `1.5px solid ${C.gold}60`,
            }}
          >
            {/* Right side: text and flag */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🇱🇾</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                العربية (Arabic)
              </span>
            </div>

            {/* Left side: Radio indicator (Active) */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 99,
                backgroundColor: C.gold,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: "bold",
                boxShadow: "0 2px 6px rgba(232, 114, 42, 0.4)",
              }}
            >
              ✓
            </div>
          </div>

          {/* English Option (Unselected) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 14,
              backgroundColor: "transparent",
              border: `1px solid ${C.border}`,
            }}
          >
            {/* Right side: text and flag */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🇺🇸</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: C.muted,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                الإنجليزية (English)
              </span>
            </div>

            {/* Left side: Radio indicator (Inactive) */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 99,
                border: `2px solid ${theme === "dark" ? "#52525b" : "#cbd5e1"}`,
                backgroundColor: "transparent",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FAVORITES SCREEN ─────────────────────────────────────────────────────────
export function FavoritesScreen({ theme = "dark" }: ScreenProps) {
  const C = getC(theme)
  const S = getS(C)
  const shop = SHOPS[0]
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "48px 20px 14px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          direction: "rtl",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 99,
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.muted,
            fontSize: 14,
          }}
        >
          →
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2
            style={{
              fontSize: 18,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              color: C.text,
            }}
          >
            قائمة المفضلة
          </h2>
          <span
            style={{
              fontSize: 11,
              backgroundColor: `${C.gold}18`,
              color: C.gold,
              padding: "2px 8px",
              borderRadius: 99,
              fontWeight: 700,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            1
          </span>
        </div>
        <div style={{ width: 34 }} />
      </div>

      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          direction: "rtl",
        }}
      >
        <div
          style={{
            ...S.card,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "relative", height: 140 }}>
            <img
              src={shop.photo}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                width: 30,
                height: 30,
                borderRadius: 99,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ❤️
            </div>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "4px 8px",
                borderRadius: 8,
                backgroundColor: "rgba(0,0,0,0.6)",
                fontSize: 10,
                color: "#34d399",
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              ● مفتوح الآن
            </div>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>
                ★ {shop.rating} ({shop.reviewCount})
              </span>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {shop.nameAr}
              </p>
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
              {shop.address}
            </p>
            <div
              style={{
                height: 38,
                borderRadius: 12,
                backgroundColor: C.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#0f0e0d",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                عرض الصالون وحجز الدور
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
