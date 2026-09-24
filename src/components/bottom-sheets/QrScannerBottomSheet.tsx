import React, { useState, useEffect, useRef } from "react"
import { BottomSheet, Button } from "@/components/ui"
import { IconQrcode, IconCheck, IconScan } from "@tabler/icons-react"

export interface QrScannerBottomSheetProps {
  open: boolean
  onClose: () => void
  onScanSuccess: (data?: { shopName?: string; staffName?: string }) => void
  shopName?: string
  title?: string
  description?: string
  successMessage?: string
  lang?: "ar" | "en"
  dir?: "rtl" | "ltr"
  simulateOptions?: Array<{
    label: string
    shopName: string
    staffName: string
  }>
}

export function QrScannerBottomSheet({
  open,
  onClose,
  onScanSuccess,
  shopName,
  title,
  description,
  successMessage,
  lang = "ar",
  dir = "rtl",
  simulateOptions,
}: QrScannerBottomSheetProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setIsScanning(false)
      setScanSuccess(false)
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    }
  }, [open])

  const handlePerformScan = (simData?: {
    shopName: string
    staffName: string
  }) => {
    if (isScanning || scanSuccess) return
    setIsScanning(true)

    scanTimerRef.current = setTimeout(() => {
      setIsScanning(false)
      setScanSuccess(true)

      completeTimerRef.current = setTimeout(() => {
        setScanSuccess(false)
        onScanSuccess(simData || { shopName: shopName || "" })
      }, 850)
    }, 900)
  }

  const defaultTitle =
    title ||
    (lang === "ar"
      ? "مسح QR المركز لتأكيد الحضور"
      : "Scan Salon QR to Confirm Presence")

  const defaultDescription =
    description ||
    (lang === "ar"
      ? `وجّه الكاميرا نحو رمز QR المعروض داخل ${
          shopName ? shopName : "المحل"
        } للتحقق من تواجدك وتأكيد العملية`
      : `Align camera with the QR code inside ${
          shopName ? shopName : "the salon"
        } to verify arrival`)

  const resolvedSuccessMessage =
    successMessage ||
    (lang === "ar"
      ? "تم التأكد من حضورك داخل المحل!"
      : "Presence Verified In-Shop!")

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        if (!isScanning) {
          onClose()
        }
      }}
      title={defaultTitle}
      description={defaultDescription}
      dir={dir}
    >
      <div className="space-y-4 py-2" dir={dir}>
        {/* Camera Viewfinder */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handlePerformScan()}
          className={`relative w-full aspect-square max-w-[260px] mx-auto rounded-3xl bg-zinc-950 border overflow-hidden flex flex-col items-center justify-center shadow-inner cursor-pointer transition-all duration-300 ${
            scanSuccess
              ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
              : "border-zinc-800 hover:border-[var(--primary)]/60"
          }`}
        >
          {/* Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          />

          {/* Corner Targeting Reticles */}
          <div
            className={`absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 rounded-tl-lg transition-colors duration-300 ${
              scanSuccess ? "border-emerald-400" : "border-[var(--primary)]"
            }`}
          />
          <div
            className={`absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 rounded-tr-lg transition-colors duration-300 ${
              scanSuccess ? "border-emerald-400" : "border-[var(--primary)]"
            }`}
          />
          <div
            className={`absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 rounded-bl-lg transition-colors duration-300 ${
              scanSuccess ? "border-emerald-400" : "border-[var(--primary)]"
            }`}
          />
          <div
            className={`absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 rounded-br-lg transition-colors duration-300 ${
              scanSuccess ? "border-emerald-400" : "border-[var(--primary)]"
            }`}
          />

          {/* Animated Laser Scanning Line */}
          {!scanSuccess && (
            <div
              className={`absolute left-6 right-6 h-0.5 shadow-[0_0_12px_var(--primary)] ${
                isScanning
                  ? "bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10b981]"
                  : "bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent shadow-[0_0_12px_var(--primary)]"
              }`}
              style={{
                animation: isScanning
                  ? "qrLaserScan 1.1s ease-in-out infinite"
                  : "qrLaserScan 2.4s ease-in-out infinite",
              }}
            />
          )}

          {/* Center Content: Success State vs Scanning State */}
          {scanSuccess ? (
            <div className="flex flex-col items-center gap-2.5 z-10 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <IconCheck size={36} stroke={3} />
              </div>
              <p className="text-xs font-bold text-emerald-400 text-center px-4">
                {resolvedSuccessMessage}
              </p>
            </div>
          ) : (
            <div className="text-zinc-600 flex flex-col items-center gap-2 z-10 select-none">
              <IconQrcode
                size={68}
                stroke={1.2}
                className={`transition-colors duration-300 ${
                  isScanning
                    ? "text-emerald-400 animate-pulse"
                    : "opacity-45 text-zinc-400"
                }`}
              />
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
                {isScanning
                  ? lang === "ar"
                    ? "جارٍ التحقق من QR..."
                    : "VERIFYING QR..."
                  : lang === "ar"
                    ? "وجّه الكاميرا نحو QR المحل"
                    : "POINT AT SHOP QR"}
              </span>
            </div>
          )}
        </div>

        {/* Optional quick simulation buttons */}
        {simulateOptions && simulateOptions.length > 0 && !scanSuccess && (
          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-bold text-[var(--muted-foreground)] text-center">
              {lang === "ar"
                ? "محاكاة مسح QR للمراكز (للتجربة)"
                : "Simulate QR Scan"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {simulateOptions.map((opt, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  disabled={isScanning}
                  onClick={() =>
                    handlePerformScan({
                      shopName: opt.shopName,
                      staffName: opt.staffName,
                    })
                  }
                  className="rounded-xl text-xs h-10 border-[var(--primary)]/30 hover:bg-[var(--primary)]/10 font-bold cursor-pointer"
                >
                  <span className="truncate">{opt.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Laser scan animation styles */}
      <style>{`
        @keyframes qrLaserScan {
          0% { top: 12%; opacity: 0.8; }
          50% { top: 86%; opacity: 1; }
          100% { top: 12%; opacity: 0.8; }
        }
      `}</style>
    </BottomSheet>
  )
}

export default QrScannerBottomSheet
