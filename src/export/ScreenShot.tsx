import { ReactNode } from "react"

const PHONE_W = 310
const PHONE_H = 672

interface Props {
  children: ReactNode
  label: string
  variant?: "dark" | "light"
}

export default function ScreenShot({
  children,
  label,
  variant = "dark",
}: Props) {
  const isDark = variant === "dark"
  const ringInner = isDark ? "#1a1916" : "#e8e0d4"
  const ringOuter = isDark ? "#2a2720" : "#d0c8bc"
  const notchBg = isDark ? "#0f0e0d" : "#f7f4ef"
  const statusColor = isDark ? "#f0ece4" : "#1a1712"
  const labelColor = isDark ? "#6a6560" : "#8a8078"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: 40,
          overflow: "hidden",
          position: "relative",
          boxShadow: `0 0 0 7px ${ringInner}, 0 0 0 8px ${ringOuter}`,
          flexShrink: 0,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 20,
            paddingTop: 8,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 90,
              height: 24,
              borderRadius: 99,
              backgroundColor: notchBg,
            }}
          />
        </div>
        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 16,
            right: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 8, color: statusColor }}>📶🔋</span>
          <div style={{ width: 60 }} />
          <span style={{ fontSize: 8, fontWeight: 600, color: statusColor }}>
            9:41
          </span>
        </div>
        {/* Content scaled down */}
        <div
          style={{
            width: 390,
            height: 844,
            transformOrigin: "top left",
            transform: `scale(${PHONE_W / 390})`,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      </div>
      <p
        style={{
          fontSize: 10,
          color: labelColor,
          fontFamily: "'Cairo', 'Outfit', sans-serif",
          textAlign: "center",
          marginTop: 2,
        }}
      >
        {label}
      </p>
    </div>
  )
}
