import { useState, useEffect, useMemo } from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { IconCheck } from "@tabler/icons-react"
import { Lang } from "@/i18n"

export interface ServiceItem {
  id: string
  name: string
  nameEn?: string
  price: number
  duration: number
  target?: string
}

export interface AddonItem {
  id: string
  name: string
  nameEn?: string
  price: number
}

export interface ServiceSelectionBottomSheetProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    serviceId: string
    addonIds: string[]
    name?: string
    staffId?: string | null
  }) => void
  services: ServiceItem[]
  addons?: AddonItem[]
  initialServiceId?: string
  initialAddonIds?: string[]
  initialStaffId?: string | null
  initialName?: string
  title?: React.ReactNode
  confirmText?: string
  cancelText?: string
  totalLabel?: string
  servicesLabel?: string
  addonsLabel?: string
  showNameInput?: boolean
  nameInputLabel?: string
  namePlaceholder?: string
  existingNames?: string[]
  lang?: Lang
  dir?: "rtl" | "ltr"
  className?: string
  // Optional backward compatibility props
  isMe?: boolean
  currentUserName?: string
  isClaimedSlot?: boolean
}

/**
 * Reusable, clean Bottom Sheet component for selecting services and add-ons.
 * Fully agnostic: all dynamic titles, labels, and button texts are received via props.
 */
export function ServiceSelectionBottomSheet({
  open,
  onClose,
  onConfirm,
  services = [],
  addons = [],
  initialServiceId,
  initialAddonIds = [],
  initialStaffId = null,
  initialName = "",
  title: titleProp,
  confirmText: confirmTextProp,
  cancelText: cancelTextProp,
  totalLabel: totalLabelProp,
  servicesLabel: servicesLabelProp,
  addonsLabel: addonsLabelProp,
  showNameInput = false,
  nameInputLabel: nameInputLabelProp,
  namePlaceholder: namePlaceholderProp,
  existingNames = [],
  lang = "ar",
  dir: dirProp,
  className,
  // Optional backward compatibility
  isMe,
  currentUserName,
}: ServiceSelectionBottomSheetProps) {
  const dir = dirProp || (lang === "ar" ? "rtl" : "ltr")

  // Determine whether to show the name input
  const shouldShowNameInput =
    showNameInput !== undefined ? showNameInput : isMe === false

  const defaultName =
    initialName || (isMe && currentUserName ? currentUserName : "")

  // Local state
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || (services[0]?.id ?? ""),
  )
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([
    ...initialAddonIds,
  ])
  const [name, setName] = useState<string>(defaultName)
  const [nameError, setNameError] = useState<string>("")

  // Sync state whenever bottom sheet opens or initial values change
  useEffect(() => {
    if (open) {
      setSelectedServiceId(initialServiceId || (services[0]?.id ?? ""))
      setSelectedAddonIds([...initialAddonIds])
      setName(defaultName)
      setNameError("")
    }
  }, [open, initialServiceId, initialAddonIds, defaultName, services])

  // Calculated subtotal
  const subtotalPrice = useMemo(() => {
    const srv = services.find((s) => s.id === selectedServiceId)
    const adds = (addons || []).filter((a) => selectedAddonIds.includes(a.id))
    return (srv?.price || 0) + adds.reduce((sum, a) => sum + a.price, 0)
  }, [selectedServiceId, selectedAddonIds, services, addons])

  // Decoupled, configurable labels and texts
  const resolvedTitle = useMemo(() => {
    if (titleProp !== undefined) return titleProp
    return lang === "ar" ? "تحديد الخدمة والإضافات" : "Select Service & Add-ons"
  }, [titleProp, lang])

  const resolvedConfirmText = useMemo(() => {
    if (confirmTextProp !== undefined) return confirmTextProp
    return lang === "ar" ? "تأكيد" : "Confirm"
  }, [confirmTextProp, lang])

  const resolvedCancelText = useMemo(() => {
    if (cancelTextProp !== undefined) return cancelTextProp
    return lang === "ar" ? "إلغاء" : "Cancel"
  }, [cancelTextProp, lang])

  const resolvedTotalLabel = useMemo(() => {
    if (totalLabelProp !== undefined) return totalLabelProp
    return lang === "ar" ? "الإجمالي:" : "Total:"
  }, [totalLabelProp, lang])

  const resolvedServicesLabel = useMemo(() => {
    if (servicesLabelProp !== undefined) return servicesLabelProp
    return lang === "ar" ? "الخدمة المطلوبة" : "Select Service"
  }, [servicesLabelProp, lang])

  const resolvedAddonsLabel = useMemo(() => {
    if (addonsLabelProp !== undefined) return addonsLabelProp
    return lang === "ar" ? "الإضافات (اختياري)" : "Add-ons (Optional)"
  }, [addonsLabelProp, lang])

  const resolvedNameLabel = useMemo(() => {
    if (nameInputLabelProp !== undefined) return nameInputLabelProp
    return lang === "ar" ? "اسم الشخص المرافق" : "Person Name"
  }, [nameInputLabelProp, lang])

  const resolvedNamePlaceholder = useMemo(() => {
    if (namePlaceholderProp !== undefined) return namePlaceholderProp
    return lang === "ar" ? "مثال: أحمد، خالد..." : "e.g. Ahmed, Khaled..."
  }, [namePlaceholderProp, lang])

  const handleSave = () => {
    if (!selectedServiceId) return

    const finalName = shouldShowNameInput ? name.trim() : defaultName
    if (shouldShowNameInput && !finalName) {
      setNameError(
        lang === "ar"
          ? "يرجى كتابة اسم الشخص أولاً"
          : "Please enter the person's name",
      )
      return
    }

    if (shouldShowNameInput && existingNames.length > 0) {
      const isDuplicate = existingNames.some(
        (existing) =>
          existing.trim().toLowerCase() === finalName.toLowerCase() &&
          existing.trim().toLowerCase() !== initialName.trim().toLowerCase(),
      )
      if (isDuplicate) {
        setNameError(
          lang === "ar"
            ? "الاسم مستخدم بالفعل لشخص آخر، يرجى اختيار اسم مختلف"
            : "Name is already taken by another person",
        )
        return
      }
    }

    onConfirm({
      serviceId: selectedServiceId,
      addonIds: selectedAddonIds,
      name: finalName,
      staffId: initialStaffId,
    })
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        setNameError("")
        onClose()
      }}
      title={resolvedTitle}
      dir={dir}
      className={className}
    >
      <div className="space-y-4 pt-1 px-1" dir={dir}>
        {/* 1. Name input section (only if requested) */}
        {shouldShowNameInput && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)] block">
              {resolvedNameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError("")
              }}
              placeholder={resolvedNamePlaceholder}
              className={`w-full px-4 py-2.5 rounded-2xl border text-sm text-[var(--foreground)] bg-[var(--card)] focus:outline-none transition-all ${
                nameError
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
              }`}
              dir={dir}
            />
            {nameError && (
              <p className="text-xs text-rose-500 font-semibold px-1">
                {nameError}
              </p>
            )}
          </div>
        )}

        {/* 2. Service selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--foreground)] block">
            {resolvedServicesLabel}
          </label>
          <ScrollFade
            orientation="vertical"
            maxHeight={200}
            fadeSize={44}
            fadeColor="var(--card)"
            useMask={true}
            enablePeek={true}
            peekDistance={24}
            peekDelay={320}
            className="w-full"
            contentClassName="grid grid-cols-1 gap-2 p-0.5"
            lang={lang}
            dir={dir}
          >
            {services.map((srv) => {
              const isSelected = selectedServiceId === srv.id
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                        isSelected
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                          : "border-[var(--muted-foreground)]/40"
                      }`}
                    >
                      {isSelected && <IconCheck size={11} stroke={3.5} />}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">
                        {lang === "ar" ? srv.name : srv.nameEn || srv.name}
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        {srv.duration} {lang === "ar" ? "دقيقة" : "min"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[var(--primary)]">
                    {srv.price} {lang === "ar" ? "د.ل" : "LYD"}
                  </span>
                </button>
              )
            })}
          </ScrollFade>
        </div>

        {/* 3. Add-ons selection (if available) */}
        {addons && addons.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--foreground)] block">
                {resolvedAddonsLabel}
              </label>
              {selectedAddonIds.length > 0 && (
                <span className="text-[11px] font-semibold text-[var(--primary)]">
                  {lang === "ar"
                    ? `${selectedAddonIds.length} محددة`
                    : `${selectedAddonIds.length} selected`}
                </span>
              )}
            </div>

            <ScrollFade
              orientation="vertical"
              maxHeight={145}
              fadeSize={32}
              fadeColor="var(--card)"
              useMask={true}
              enablePeek={true}
              peekDistance={20}
              peekDelay={340}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xs"
              contentClassName="divide-y divide-[var(--border)]"
              lang={lang}
              dir={dir}
            >
              {addons.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id)
                return (
                  <div
                    key={addon.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAddonIds(
                          selectedAddonIds.filter((id) => id !== addon.id),
                        )
                      } else {
                        setSelectedAddonIds([...selectedAddonIds, addon.id])
                      }
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors select-none ${
                      isSelected
                        ? "bg-[var(--primary)]/10"
                        : "hover:bg-[var(--muted)]/40"
                    }`}
                  >
                    {/* Checkbox and Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-[var(--primary)] text-black shadow-xs"
                            : "border border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        {isSelected && <IconCheck size={11} stroke={3.5} />}
                      </div>
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? "font-semibold text-[var(--foreground)]"
                            : "text-[var(--foreground)]/85"
                        }`}
                      >
                        {lang === "ar"
                          ? addon.name
                          : addon.nameEn || addon.name}
                      </span>
                    </div>

                    {/* Price */}
                    <span
                      className={`text-xs font-semibold shrink-0 ${
                        isSelected
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      +{addon.price} {lang === "ar" ? "د.ل" : "LYD"}
                    </span>
                  </div>
                )
              })}
            </ScrollFade>
          </div>
        )}

        {/* 4. Price Preview & Action Buttons */}
        <div className="pt-2 border-t border-[var(--border)]/70 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[var(--muted-foreground)] font-medium">
              {resolvedTotalLabel}
            </span>
            <span className="text-sm font-extrabold text-[var(--primary)]">
              {subtotalPrice} {lang === "ar" ? "د.ل" : "LYD"}
            </span>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setNameError("")
                onClose()
              }}
              className="rounded-xl h-11"
            >
              {resolvedCancelText}
            </Button>
            <Button
              fullWidth
              disabled={!selectedServiceId}
              onClick={handleSave}
              className="rounded-xl h-11 font-bold shadow-xs cursor-pointer"
            >
              {resolvedConfirmText}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ServiceSelectionBottomSheet
