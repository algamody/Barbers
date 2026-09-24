import { useState, useRef, useEffect, useMemo } from "react"
import { SHOPS, StaffMember } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { PersonBooking, GroupBookingData } from "../types/booking"
import {
  Button,
  Card,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  AlertDialog,
  BottomSheet,
  showSnackbar,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Rating,
  BackButton,
} from "@/components/ui"
import {
  ServiceSelectionBottomSheet,
  QrScannerBottomSheet,
} from "@/components/bottom-sheets"
import {
  IconCreditCard,
  IconCash,
  IconAlertTriangle,
  IconCheck,
  IconTicket,
  IconX,
  IconSparkles,
  IconClock,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconUserPlus,
  IconTrash,
  IconPencil,
  IconChevronUp,
  IconChevronDown,
  IconGripVertical,
  IconBolt,
} from "@tabler/icons-react"
import lypayLogo from "@/public/lypay.svg"
import onepayLogo from "@/public/onepay.png"

interface Props {
  shopId: string
  serviceId?: string
  addonIds?: string[]
  theme: Theme
  lang: Lang
  onBack: (serviceId?: string, addonIds?: string[]) => void
  onConfirm: (groupData?: GroupBookingData) => void
  addingPersonName?: string
  initialPersons?: PersonBooking[]
  initialStep?: "barber" | "group_list" | "confirm"
  isClaimedSlot?: boolean
  claimedStaffId?: string
  depositPaid?: number
  onUpdatePersons?: (persons: PersonBooking[]) => void
  onAddPersonRequest?: (name: string, currentPersons: PersonBooking[]) => void
  onBackToShopDetailForPerson?: () => void
}

export default function BookingFlow({
  shopId,
  serviceId,
  addonIds = [],
  theme,
  lang,
  onBack,
  onConfirm,
  addingPersonName,
  initialPersons = [],
  initialStep,
  isClaimedSlot,
  claimedStaffId,
  depositPaid = 5,
  onUpdatePersons,
  onAddPersonRequest,
  onBackToShopDetailForPerson,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const shop = SHOPS.find((s) => s.id === shopId)!
  const currentServiceId = serviceId || shop.services[0].id
  const service =
    shop.services.find((s) => s.id === currentServiceId) || shop.services[0]
  const chosenAddons = (shop.addons || []).filter((a) =>
    addonIds.includes(a.id),
  )
  const addonsTotal = chosenAddons.reduce((sum, a) => sum + a.price, 0)

  // User name from profile / localStorage
  const currentUserName = (() => {
    try {
      const saved = localStorage.getItem("user_profile")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name && parsed.name.trim()) return parsed.name.trim()
      }
    } catch {}
    return lang === "ar" ? "محمد القمودي" : "Mohammed Algamody"
  })()

  // Persons in this group booking
  const [persons, setPersons] = useState<PersonBooking[]>(() => {
    if (isClaimedSlot) {
      return [
        {
          id: "me",
          name: currentUserName,
          isMe: true,
          serviceId: currentServiceId,
          addonIds: addonIds,
          staffId: claimedStaffId || null,
        },
      ]
    }
    if (initialPersons && initialPersons.length > 0) {
      return initialPersons.map((p) =>
        p.isMe
          ? {
              ...p,
              name:
                p.name === "أنت" || p.name === "You"
                  ? currentUserName
                  : p.name || currentUserName,
            }
          : p,
      )
    }
    return [
      {
        id: "me",
        name: currentUserName,
        isMe: true,
        serviceId: currentServiceId,
        addonIds: addonIds,
        staffId: null,
      },
    ]
  })

  // Modal state for adding another person
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)
  const [newPersonName, setNewPersonName] = useState("")
  const [nameError, setNameError] = useState("")
  const personInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showAddPersonModal) {
      // Focus smoothly without scrolling or moving the background screen
      const timer = setTimeout(() => {
        personInputRef.current?.focus({ preventScroll: true })
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [showAddPersonModal])

  // Edit Person Modal state
  const [editingPerson, setEditingPerson] = useState<PersonBooking | null>(null)

  const handleOpenEditPerson = (person: PersonBooking) => {
    setEditingPerson(person)
  }

  const [selectedStaff, setSelectedStaff] = useState<string | null>(() => {
    if (addingPersonName) return null
    const me = persons.find((p) => p.isMe)
    return me ? me.staffId : null
  })
  const [payment, setPayment] = useState<"wallet" | "cash" | null>(null)
  const [paymentAccordionOpen, setPaymentAccordionOpen] = useState(false)
  const [paymentError, setPaymentError] = useState(false)
  const [step, setStep] = useState<"barber" | "group_list" | "confirm">(
    initialStep || (addingPersonName ? "barber" : "barber"),
  )
  const [showCashWarningAlert, setShowCashWarningAlert] = useState(false)
  const [showClosedAlert, setShowClosedAlert] = useState(false)
  const [showClaimedSlotConfirmAlert, setShowClaimedSlotConfirmAlert] =
    useState(false)
  const [showClaimedSlotQrScanner, setShowClaimedSlotQrScanner] =
    useState(false)
  const chosenStaff = shop.staff.find((s) => s.id === selectedStaff)

  // Group persons by their assigned barber (or "any" if auto-assign)
  const barberGroups = useMemo(() => {
    const map = new Map<string, {
      barberKey: string
      staff: StaffMember | null
      items: {
        person: PersonBooking
        originalIndex: number
      }[]
    }>()

    persons.forEach((person, index) => {
      const staff =
        person.staffId && person.staffId !== "any"
          ? shop.staff.find((st) => st.id === person.staffId) || null
          : null
      const barberKey = staff ? staff.id : "any"

      if (!map.has(barberKey)) {
        map.set(barberKey, {
          barberKey,
          staff,
          items: [],
        })
      }
      map.get(barberKey)!.items.push({ person, originalIndex: index })
    })

    return Array.from(map.values())
  }, [persons, shop.staff])

  const isShopClosed = (() => {
    try {
      const saved = localStorage.getItem(`community_data_${shopId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.isOpen === "boolean") return !parsed.isOpen
      }
    } catch {}
    return !shop.isOpen
  })()

  // Wallet Balance State (Synced with localStorage)
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem("wallet_balance")
      if (saved) return parseFloat(saved)
    } catch {}
    return 48
  })

  // Top Up Wallet BottomSheet State
  const [showTopUpSheet, setShowTopUpSheet] = useState(false)
  const [selectedTopUpProvider, setSelectedTopUpProvider] =
    useState<"onepay" | "lypay" | null>(null)
  const [topUpAmountInput, setTopUpAmountInput] = useState("")

  const parsedTopUpAmount = parseFloat(topUpAmountInput)
  const isValidTopUpAmount = !isNaN(parsedTopUpAmount) && parsedTopUpAmount > 0

  const handleConfirmTopUp = () => {
    if (!selectedTopUpProvider || !isValidTopUpAmount) return

    const topUpValue = parsedTopUpAmount
    setWalletBalance((prev) => {
      const next = prev + topUpValue
      try {
        localStorage.setItem("wallet_balance", next.toString())
      } catch {}
      return next
    })

    setShowTopUpSheet(false)
    setSelectedTopUpProvider(null)
    setTopUpAmountInput("")
    setPayment("wallet")

    showSnackbar({
      title:
        lang === "ar"
          ? "تم شحن المحفظة بنجاح"
          : "Wallet topped up successfully",
      description:
        lang === "ar"
          ? `تمت إضافة ${topUpValue.toFixed(2)} د.ل إلى رصيدك`
          : `Added ${topUpValue.toFixed(2)} LYD to your wallet`,
      type: "success",
    })
  }

  // Promo Code State
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    title: string
    discount: number
  } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyPromo = () => {
    const trimmed = promoCode.trim().toUpperCase()
    if (!trimmed) return

    setIsApplying(true)
    setPromoError(null)

    setTimeout(() => {
      setIsApplying(false)
      if (
        trimmed.includes("100PTS") ||
        trimmed === "SAVE5" ||
        trimmed === "DISCOUNT5" ||
        trimmed === "WELCOME"
      ) {
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "خصم 5 دينار (كود المكافآت)"
              : "5 LYD Discount (Reward Code)",
          discount: 5,
        })
      } else if (
        trimmed.includes("200PTS") ||
        trimmed === "SAVE10" ||
        trimmed === "10%"
      ) {
        const disc = Math.round((service.price * 10) / 100)
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "خصم 10% (كود المكافآت)"
              : "10% Discount (Reward Code)",
          discount: disc > 0 ? disc : 3,
        })
      } else if (
        trimmed.includes("150PTS") ||
        trimmed === "FACIAL" ||
        trimmed === "MASK"
      ) {
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "جلسة قناع وعناية مجانية (خصم 8 د.ل)"
              : "Free Facial Mask (8 LYD off)",
          discount: 8,
        })
      } else if (trimmed.includes("300PTS") || trimmed === "VIP15") {
        setAppliedPromo({
          code: trimmed,
          title: lang === "ar" ? "خصم 15 دينار VIP" : "15 LYD VIP Discount",
          discount: 15,
        })
      } else if (trimmed.includes("450PTS") || trimmed === "FREE") {
        setAppliedPromo({
          code: trimmed,
          title: lang === "ar" ? "حلاقة مجانية بالكامل" : "100% Free Haircut",
          discount: service.price,
        })
      } else if (
        trimmed.startsWith("SAVE-") ||
        trimmed.startsWith("RC-") ||
        trimmed.length >= 4
      ) {
        setAppliedPromo({
          code: trimmed,
          title:
            lang === "ar"
              ? "كود خصم النقاط الترويجي (5 د.ل)"
              : "Points Promo Voucher (5 LYD)",
          discount: 5,
        })
      } else {
        setPromoError(
          lang === "ar"
            ? "كود الخصم المدخل غير صالح أو منتهي الصلاحية"
            : "Invalid or expired promo code",
        )
      }
    }, 200)
  }

  // Group base price calculation
  const totalBasePrice = persons.reduce((sum, p) => {
    const s = shop.services.find((srv) => srv.id === p.serviceId)
    const adds = (shop.addons || []).filter((a) => p.addonIds.includes(a.id))
    return sum + (s?.price || 0) + adds.reduce((aSum, a) => aSum + a.price, 0)
  }, 0)

  const activeBasePrice =
    step === "barber" && !persons.some((p) => p.isMe && p.staffId)
      ? service.price + addonsTotal
      : totalBasePrice

  const discount = appliedPromo
    ? Math.min(activeBasePrice, appliedPromo.discount)
    : 0
  const finalPrice = Math.max(0, activeBasePrice - discount)

  const handleMovePerson = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= persons.length) return
    const updated = [...persons]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setPersons(updated)
    if (onUpdatePersons) onUpdatePersons(updated)
  }

  const handleDeletePerson = (id: string) => {
    const target = persons.find((p) => p.id === id)
    if (!target || target.isMe) return
    const updated = persons.filter((p) => p.id !== id)
    setPersons(updated)
    if (onUpdatePersons) onUpdatePersons(updated)
  }

  const handleStartAddPerson = () => {
    const trimmed = newPersonName.trim()
    if (!trimmed) {
      setNameError(T.personNameRequired)
      return
    }

    // Check for duplicate name (case-insensitive)
    const isDuplicate = persons.some((p) => {
      const existingName = (p.isMe ? currentUserName : p.name)
        .trim()
        .toLowerCase()
      return existingName === trimmed.toLowerCase()
    })

    if (isDuplicate) {
      setNameError(T.personNameDuplicate)
      return
    }

    setNameError("")
    setShowAddPersonModal(false)
    setNewPersonName("")
    if (onAddPersonRequest) {
      onAddPersonRequest(trimmed, persons)
    }
  }

  const handleHeaderBack = () => {
    if (step === "confirm") {
      if (isClaimedSlot) {
        onBack(persons[0]?.serviceId, persons[0]?.addonIds)
        return
      }
      setStep("group_list")
      return
    }
    if (step === "group_list") {
      setStep("barber")
      return
    }
    if (step === "barber") {
      if (addingPersonName && onBackToShopDetailForPerson) {
        onBackToShopDetailForPerson()
        return
      }
      onBack()
    }
  }

  const executeConfirm = () => {
    if (!payment) return

    const slotFee = isClaimedSlot ? (depositPaid ?? 5) : 0
    const walletDeduction =
      (isClaimedSlot ? slotFee : 0) + (payment === "wallet" ? finalPrice : 0)

    if (walletDeduction > 0) {
      try {
        const current = parseFloat(
          localStorage.getItem("wallet_balance") || "48",
        )
        const next = Math.max(0, current - walletDeduction)
        localStorage.setItem("wallet_balance", next.toString())
        setWalletBalance(next)
      } catch {}
    }

    if (isClaimedSlot && claimedStaffId) {
      try {
        const saved = JSON.parse(
          localStorage.getItem(`claimed_slots_${shop.id}`) || "{}",
        )
        saved[claimedStaffId] = true
        localStorage.setItem(`claimed_slots_${shop.id}`, JSON.stringify(saved))
      } catch {}
    }

    const groupBookingData: GroupBookingData = {
      bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      shopId: shop.id,
      shopName: lang === "ar" ? shop.nameAr : shop.name,
      staffName:
        persons.length === 1
          ? shop.staff.find((s) => s.id === persons[0].staffId)?.name ||
            (lang === "ar" ? "أي حلاق متاح" : "Any Barber")
          : lang === "ar"
            ? `مجموعة (${persons.length} أشخاص)`
            : `Group (${persons.length} persons)`,
      service:
        persons.length === 1
          ? shop.services.find((s) => s.id === persons[0].serviceId)?.name || ""
          : lang === "ar"
            ? "خدمات متعددة"
            : "Multiple Services",
      addons:
        persons.length === 1
          ? (shop.addons || [])
              .filter((a) => persons[0].addonIds.includes(a.id))
              .map((a) => a.name)
              .join("، ") || (lang === "ar" ? "لا توجد" : "None")
          : lang === "ar"
            ? "حسب كل شخص"
            : "Per person",
      position: isClaimedSlot ? 1 : 2,
      totalAhead: isClaimedSlot ? 0 : 3,
      estimatedWait: isClaimedSlot
        ? 5
        : persons.reduce((acc, p) => {
            const s = shop.services.find((srv) => srv.id === p.serviceId)
            return acc + (s?.duration || 25)
          }, 0),
      status: isClaimedSlot ? "next_up" : "in_queue",
      paymentMethod: payment || "wallet",
      totalPrice: isClaimedSlot ? finalPrice + slotFee : finalPrice,
      attendanceConfirmed: !!isClaimedSlot,
      isClaimedSlot: !!isClaimedSlot,
      persons: persons.map((p) => {
        const srv = shop.services.find((s) => s.id === p.serviceId)
        const chosenAdds = (shop.addons || []).filter((a) =>
          p.addonIds.includes(a.id),
        )
        const staff = shop.staff.find((st) => st.id === p.staffId)
        const pPrice =
          (srv?.price || 0) + chosenAdds.reduce((sum, a) => sum + a.price, 0)
        return {
          id: p.id,
          name: p.isMe ? currentUserName : p.name,
          isMe: p.isMe,
          serviceId: p.serviceId,
          serviceName: srv ? (lang === "ar" ? srv.name : srv.nameEn) : "",
          addonIds: p.addonIds,
          addonNames: chosenAdds.map((a) => a.name),
          staffId: p.staffId,
          staffName: staff
            ? staff.name
            : lang === "ar"
              ? "أي حلاق متاح"
              : "Any Barber",
          price: pPrice,
          confirmed: true,
        }
      }),
    }

    try {
      localStorage.setItem(
        "active_group_booking",
        JSON.stringify(groupBookingData),
      )
    } catch {}

    onConfirm(groupBookingData)
  }

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: C.bg }}
      dir={dir}
    >
      {/* Header with step indicator */}
      <div
        className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-[var(--border)]"
        dir={dir}
      >
        <BackButton
          variant="ghost"
          dir={dir}
          onClick={handleHeaderBack}
          className="text-[var(--muted-foreground)] shrink-0 cursor-pointer"
        />
        <div
          className="flex-1 min-w-0"
          style={{ textAlign: dir === "rtl" ? "right" : "left" }}
        >
          <h2
            className="text-lg font-light text-[var(--foreground)] truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {step === "barber"
              ? addingPersonName
                ? T.chooseBarberFor(addingPersonName)
                : T.chooseBarber
              : step === "group_list"
                ? T.groupBooking
                : T.confirmBooking}
          </h2>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {(["barber", "group_list", "confirm"] as const).map((s, idx) => {
            const stepOrder = { barber: 1, group_list: 2, confirm: 3 }
            const currentOrder = stepOrder[step]
            const thisOrder = idx + 1
            return (
              <div
                key={s}
                className="rounded-full transition-all duration-300"
                style={{
                  width: currentOrder >= thisOrder ? 16 : 6,
                  height: 6,
                  backgroundColor:
                    currentOrder >= thisOrder ? C.gold : C.border,
                }}
              />
            )
          })}
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto overscroll-contain px-5 py-5 ${
          step === "confirm" ? "pb-8" : "pb-28"
        }`}
      >
        {step === "barber" && (
          <div dir={dir} className="space-y-3">
            <p className="text-xs tracking-widest uppercase mb-4 text-[var(--muted-foreground)]">
              {addingPersonName
                ? T.chooseBarberFor(addingPersonName)
                : T.chooseBarber}
              ?
            </p>

            {/* Any barber option */}
            <Card
              interactive
              onClick={() => setSelectedStaff("any")}
              className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                selectedStaff === "any"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {selectedStaff === "any" && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--primary)] text-black shrink-0">
                    <IconCheck size={11} stroke={3.5} />
                  </span>
                )}
                <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {T.anyBarber}
                  </p>
                  <p className="text-xs mt-0.5 text-[var(--muted-foreground)]">
                    {T.autoAssign}
                  </p>
                </div>
              </div>
              <span
                className="text-xs text-[var(--muted-foreground)] shrink-0"
                style={{ textAlign: dir === "rtl" ? "left" : "right" }}
              >
                {T.leastWait}
              </span>
            </Card>

            {/* Barber list */}
            {shop.staff.map((st) => {
              const isInactive = st.isActive === false
              const isSelected = selectedStaff === st.id

              return (
                <Card
                  key={st.id}
                  interactive={!isInactive}
                  onClick={() => {
                    if (!isInactive) setSelectedStaff(st.id)
                  }}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                    isInactive
                      ? "opacity-55 cursor-not-allowed bg-[var(--muted)]/30 border-dashed border-[var(--border)]"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--primary)] text-black shrink-0">
                        <IconCheck size={11} stroke={3.5} />
                      </span>
                    )}
                    <div className="relative shrink-0">
                      <Avatar
                        size="default"
                        className={
                          isInactive ? "opacity-75 grayscale-[35%]" : ""
                        }
                      >
                        <AvatarImage src={st.photo} alt={st.name} />
                      </Avatar>
                      {isInactive && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-400 border-2 border-[var(--card)]"
                          title={T.inactiveBarber}
                        />
                      )}
                    </div>
                    <div
                      className="min-w-0"
                      style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                    >
                      <p
                        className={`text-sm font-semibold truncate ${
                          isInactive
                            ? "text-[var(--muted-foreground)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {st.name}
                      </p>
                      <div className="mt-0.5">
                        <Rating
                          value={st.rating}
                          size={11}
                          textClassName="text-xs font-semibold text-[var(--muted-foreground)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="shrink-0 flex flex-col"
                    style={{
                      textAlign: dir === "rtl" ? "left" : "right",
                      alignItems: dir === "rtl" ? "flex-start" : "flex-end",
                    }}
                  >
                    {isInactive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-500 border border-zinc-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        <span>{T.inactiveBarber}</span>
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {st.queue}
                          {T.waiting2}
                        </span>
                        <p className="text-xs font-bold text-[var(--primary)] flex items-center gap-1">
                          <IconClock
                            size={12}
                            stroke={2}
                            className="text-[var(--primary)] shrink-0"
                          />
                          <span>
                            ~{st.avgWait} {T.mins}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Step: Group List (قائمة الأشخاص في الحجز وترتيب الطابور) */}
        {step === "group_list" && (
          <div dir={dir} className="space-y-4">
            {/* Top helper banner */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {isClaimedSlot
                    ? lang === "ar"
                      ? "تفاصيل الدور المحجوز"
                      : "Claimed Slot Details"
                    : T.reorderQueue}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {isClaimedSlot
                    ? lang === "ar"
                      ? "حجز دور بديل فردي حفاظاً على الطابور"
                      : "Single claimed slot to preserve queue order"
                    : T.dragToReorder}
                </p>
              </div>

              {isClaimedSlot ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <IconBolt
                    size={14}
                    stroke={2.5}
                    className="text-amber-500 shrink-0"
                  />
                  <span>
                    {lang === "ar" ? "دور بديل (فردي)" : "Single Slot"}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setNewPersonName("")
                      setNameError("")
                      setShowAddPersonModal(true)
                    }}
                    className="h-8 px-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 font-bold flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer transition-all active:scale-95"
                  >
                    <IconUserPlus
                      size={15}
                      stroke={2.2}
                      className="text-[var(--primary)]"
                    />
                    <span>{T.add || "إضافة"}</span>
                  </Button>
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)]">
                    {T.count} {persons.length}
                  </span>
                </div>
              )}
            </div>

            {/* List of Persons grouped by Barber in Dropdown/Accordion */}
            <Accordion
              type="multiple"
              defaultValue={
                barberGroups.length === 1
                  ? [barberGroups[0].barberKey]
                  : [barberGroups[0]?.barberKey]
              }
              className="space-y-3"
            >
              {barberGroups.map((group) => {
                const isAnyBarber = !group.staff || group.barberKey === "any"
                const groupTotal = group.items.reduce((sum, { person }) => {
                  const pService = shop.services.find(
                    (s) => s.id === person.serviceId,
                  )
                  const pAddons = (shop.addons || []).filter((a) =>
                    person.addonIds.includes(a.id),
                  )
                  return (
                    sum +
                    (pService?.price || 0) +
                    pAddons.reduce((addonSum, a) => addonSum + a.price, 0)
                  )
                }, 0)

                return (
                  <AccordionItem
                    key={group.barberKey}
                    value={group.barberKey}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs transition-all duration-200"
                  >
                    {/* Header (Trigger): Barber avatar, name, total price, count, and animated chevron */}
                    <AccordionTrigger className="p-3.5 hover:bg-[var(--secondary)]/30 transition-colors">
                      <div className="flex items-center justify-between w-full gap-3">
                        {/* Start side: Avatar + Barber Name + Subtitle */}
                        <div className="flex items-center gap-3 min-w-0">
                          {!isAnyBarber && group.staff ? (
                            <Avatar
                              size="default"
                              className="w-11 h-11 border border-[var(--border)] shrink-0 shadow-2xs"
                            >
                              <AvatarImage
                                src={group.staff.photo}
                                alt={group.staff.name}
                              />
                              <AvatarFallback className="bg-[var(--secondary)] font-bold text-xs text-[var(--foreground)]">
                                {group.staff.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-2xs">
                              <IconSparkles size={20} stroke={2} />
                            </div>
                          )}

                          <div className="text-start min-w-0">
                            <p className="text-sm font-bold text-[var(--foreground)] truncate">
                              {!isAnyBarber && group.staff
                                ? group.staff.name
                                : T.anyBarber}
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5">
                              {!isAnyBarber && group.staff ? (
                                <>
                                  <Rating
                                    value={group.staff.rating}
                                    size={11}
                                  />
                                </>
                              ) : (
                                <span>{T.autoAssign}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* End side: Total price and Count badge */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-end">
                            <span className="text-sm font-extrabold text-[var(--primary)] block leading-tight">
                              {groupTotal} {lang === "ar" ? "د.ل" : "LYD"}
                            </span>
                            <span className="text-[10px] font-medium text-[var(--muted-foreground)] block">
                              {lang === "ar" ? "المجموع" : "Total"}
                            </span>
                          </div>

                          <Badge
                            variant="secondary"
                            className="font-bold text-xs px-2.5 py-1 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]/70"
                          >
                            {T.count} {group.items.length}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>

                    {/* Content: Persons assigned to this barber */}
                    <AccordionContent className="p-3 pt-0 space-y-2.5">
                      {group.items.map(
                        ({ person, originalIndex }, personIndex) => {
                          const pService = shop.services.find(
                            (s) => s.id === person.serviceId,
                          )
                          const pAddons = (shop.addons || []).filter((a) =>
                            person.addonIds.includes(a.id),
                          )
                          const pPrice =
                            (pService?.price || 0) +
                            pAddons.reduce((sum, a) => sum + a.price, 0)

                          return (
                            <div
                              key={person.id}
                              draggable
                              onDragStart={(e) =>
                                e.dataTransfer.setData(
                                  "text/plain",
                                  originalIndex.toString(),
                                )
                              }
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault()
                                const draggedIndex = parseInt(
                                  e.dataTransfer.getData("text/plain"),
                                  10,
                                )
                                if (
                                  !isNaN(draggedIndex) &&
                                  draggedIndex !== originalIndex
                                ) {
                                  const reordered = [...persons]
                                  const [moved] = reordered.splice(
                                    draggedIndex,
                                    1,
                                  )
                                  reordered.splice(originalIndex, 0, moved)
                                  setPersons(reordered)
                                  if (onUpdatePersons)
                                    onUpdatePersons(reordered)
                                }
                              }}
                              className={`p-3.5 rounded-2xl transition-all relative border shadow-2xs ${
                                person.isMe
                                  ? "border-[#2F6FA8]/40 bg-[#2F6FA8]/5 dark:bg-[#2F6FA8]/10"
                                  : "border-[var(--border)]/80 bg-[var(--card)] hover:border-[var(--primary)]/30"
                              }`}
                            >
                              {/* Top row: Queue Position, Name/Badge, Actions */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      person.isMe
                                        ? "bg-[#2F6FA8] text-white"
                                        : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                                    }`}
                                  >
                                    #{personIndex + 1}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-[var(--foreground)]">
                                      {person.isMe
                                        ? currentUserName
                                        : person.name}
                                    </span>
                                    {person.isMe && (
                                      <Badge
                                        size="sm"
                                        className="bg-[#2F6FA8] text-white hover:bg-[#2F6FA8] border-none text-[10px] py-0 px-2 font-bold"
                                      >
                                        {T.you}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Controls: Edit and Delete */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenEditPerson(person)
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 cursor-pointer transition-colors"
                                    title={lang === "ar" ? "تعديل" : "Edit"}
                                  >
                                    <IconPencil size={15} stroke={2} />
                                  </button>

                                  {!person.isMe && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeletePerson(person.id)
                                      }}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                      title={T.deletePerson}
                                    >
                                      <IconTrash size={15} stroke={2} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Middle row: Service and Addons */}
                              <div className="text-xs space-y-1.5 text-[var(--muted-foreground)] border-t border-[var(--border)]/60 pt-2">
                                <div className="flex items-center justify-between">
                                  <span>
                                    {lang === "ar" ? "الخدمة:" : "Service:"}
                                  </span>
                                  <span className="font-semibold text-[var(--foreground)]">
                                    {lang === "ar"
                                      ? pService?.name
                                      : pService?.nameEn}{" "}
                                    <span className="text-[var(--foreground)] font-bold">
                                      ({pService?.price || 0}{" "}
                                      {lang === "ar" ? "د.ل" : "LYD"})
                                    </span>
                                  </span>
                                </div>
                                {pAddons.length > 0 && (
                                  <div className="flex items-start justify-between gap-2 pt-0.5">
                                    <span className="shrink-0">
                                      {lang === "ar" ? "الإضافات:" : "Add-ons:"}
                                    </span>
                                    <div className="flex flex-col items-end gap-1">
                                      {pAddons.map((a) => (
                                        <span
                                          key={a.id}
                                          className="font-medium text-[var(--foreground)]"
                                        >
                                          {a.name}{" "}
                                          <span className="text-[var(--foreground)] font-semibold">
                                            ({a.price}{" "}
                                            {lang === "ar" ? "د.ل" : "LYD"})
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Bottom: Subtotal for this person */}
                              <div className="mt-2 pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-xs">
                                <span className="text-[var(--muted-foreground)]">
                                  {lang === "ar"
                                    ? "تكلفة هذا الدور:"
                                    : "Person Subtotal:"}
                                </span>
                                <span className="font-bold text-[var(--primary)] text-sm">
                                  {pPrice} {lang === "ar" ? "د.ل" : "LYD"}
                                </span>
                              </div>
                            </div>
                          )
                        },
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        )}

        {step === "confirm" && (
          <div dir={dir} className="space-y-4">
            {/* 1. Payment method selection in Accordion (طريقة الدفع) */}
            <div id="payment-method-section" className="space-y-1.5">
              <Accordion
                type="single"
                collapsible
                value={paymentAccordionOpen ? "payment" : ""}
                onValueChange={(val) => {
                  setPaymentAccordionOpen(val === "payment")
                }}
                className="w-full"
              >
                <AccordionItem
                  value="payment"
                  className={`rounded-2xl border transition-all ${
                    paymentError && !payment
                      ? "border-red-500/80 bg-red-500/5 ring-2 ring-red-500/30"
                      : payment
                        ? "border-[var(--primary)]/50 bg-[var(--card)] shadow-xs"
                        : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <AccordionTrigger className="p-3.5 hover:bg-[var(--secondary)]/30 transition-colors">
                    <div className="flex items-center justify-between w-full gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            payment === "wallet"
                              ? "bg-[var(--primary)] text-white shadow-xs"
                              : payment === "cash"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : paymentError && !payment
                                  ? "bg-red-500/15 text-red-500"
                                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {payment === "cash" ? (
                            <IconCash size={20} stroke={1.8} />
                          ) : (
                            <IconCreditCard size={20} stroke={1.8} />
                          )}
                        </div>
                        <div className="text-start min-w-0">
                          <p className="text-xs tracking-wider uppercase font-bold text-[var(--foreground)]">
                            {T.paymentMethod}
                          </p>
                          {payment && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                              {payment === "wallet" ? (
                                <span className="font-semibold text-[var(--primary)]">
                                  {T.wallet} ({T.balance}:{" "}
                                  {walletBalance.toFixed(2)}{" "}
                                  {lang === "ar" ? "د.ل" : "LYD"})
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {T.cash}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {payment && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20"
                          >
                            {payment === "wallet" ? T.wallet : T.cash}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-[var(--border)]/60">
                    {/* 1. Wallet Option */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setPayment("wallet")
                        setPaymentError(false)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                        payment === "wallet"
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            payment === "wallet"
                              ? "bg-[var(--primary)] text-white shadow-xs"
                              : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          <IconCreditCard size={20} stroke={1.8} />
                        </div>
                        <div className="text-start">
                          <p
                            className={`text-sm font-bold ${
                              payment === "wallet"
                                ? "text-[var(--primary)]"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            {T.wallet}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {T.balance}: {walletBalance.toFixed(2)}{" "}
                            {lang === "ar" ? "د.ل" : "LYD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowTopUpSheet(true)
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <IconPlus size={13} stroke={2.5} />
                          <span>{lang === "ar" ? "شحن" : "Top Up"}</span>
                        </button>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            payment === "wallet"
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--muted-foreground)]/40"
                          }`}
                        >
                          {payment === "wallet" && (
                            <IconCheck size={12} stroke={3} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. Cash Option */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setPayment("cash")
                        setPaymentError(false)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                        payment === "cash"
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)] shadow-xs"
                          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            payment === "cash"
                              ? "bg-[var(--primary)] text-white shadow-xs"
                              : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          <IconCash size={20} stroke={1.8} />
                        </div>
                        <div className="text-start">
                          <p
                            className={`text-sm font-bold ${
                              payment === "cash"
                                ? "text-[var(--primary)]"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            {T.cash}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          payment === "cash"
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--muted-foreground)]/40"
                        }`}
                      >
                        {payment === "cash" && (
                          <IconCheck size={12} stroke={3} />
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {paymentError && !payment && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1 px-1">
                  <IconAlertTriangle size={14} className="shrink-0" />
                  <span>
                    {lang === "ar"
                      ? "يرجى اختيار طريقة الدفع أولاً لمتابعة الحجز"
                      : "Please select a payment method first to proceed"}
                  </span>
                </p>
              )}
            </div>

            {/* 2. Discount Code Input Section (كود الخصم) */}
            <Card className="rounded-2xl p-4 space-y-2.5 border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-widest uppercase font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <IconTicket size={16} className="text-[var(--primary)]" />
                  <span>{lang === "ar" ? "كود الخصم" : "Discount Code"}</span>
                </span>
                {appliedPromo && (
                  <Badge
                    variant="success"
                    className="text-[10px] px-2 py-0.5 font-bold"
                  >
                    {lang === "ar" ? "تم التفعيل" : "Applied"}
                  </Badge>
                )}
              </div>

              {!appliedPromo ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value)
                          setPromoError(null)
                        }}
                        placeholder={
                          lang === "ar"
                            ? "أدخل كود الخصم ..."
                            : "Enter promo code ..."
                        }
                        className="w-full h-10 px-3.5 pe-8 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-xs font-mono font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)] placeholder:font-sans uppercase"
                        dir={dir}
                      />
                      {promoCode && (
                        <button
                          type="button"
                          onClick={() => {
                            setPromoCode("")
                            setPromoError(null)
                          }}
                          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                        >
                          <IconX size={14} />
                        </button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || isApplying}
                      className="rounded-xl h-10 px-4 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      {isApplying ? "..." : lang === "ar" ? "تطبيق" : "Apply"}
                    </Button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 pt-0.5">
                      <IconAlertTriangle size={13} stroke={2.5} />
                      <span>{promoError}</span>
                    </p>
                  )}

                  <p className="text-[10px] text-[var(--muted-foreground)] leading-normal">
                    {lang === "ar"
                      ? "💡 يمكنك الحصول على أكواد خصم باستبدال نقاطك في صفحة نقاط المكافآت بحسابك."
                      : "💡 Redeem points in your profile to obtain discount voucher codes."}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <IconCheck size={18} stroke={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[var(--foreground)]">
                          {appliedPromo.code}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                          -{discount} {lang === "ar" ? "د.ل" : "LYD"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {appliedPromo.title}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null)
                      setPromoCode("")
                    }}
                    className="w-7 h-7 rounded-lg bg-[var(--card)] hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 border border-[var(--border)] flex items-center justify-center transition-colors cursor-pointer"
                    title={lang === "ar" ? "إلغاء الكود" : "Remove"}
                  >
                    <IconX size={14} stroke={2.2} />
                  </button>
                </div>
              )}
            </Card>

            {/* 3. Booking summary Card (ملخص الحجز) */}
            <Card className="rounded-2xl px-4 py-4 space-y-3.5 border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/70">
                <span className="text-xs tracking-widest uppercase text-[var(--muted-foreground)] font-semibold flex items-center gap-1.5">
                  <IconTicket size={15} className="text-[var(--primary)]" />
                  <span>{T.bookingSummary}</span>
                </span>
                {persons.length > 1 && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-semibold"
                  >
                    {T.personsCount(persons.length)}
                  </Badge>
                )}
              </div>

              {persons.length > 1 ? (
                <>
                  {/* Shop & General info */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">
                      {T.shop}
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {lang === "ar" ? shop.nameAr : shop.name}
                    </span>
                  </div>

                  {/* Breakdown per person, grouped by barber in Accordion */}
                  <div className="pt-1">
                    <Accordion
                      type="multiple"
                      defaultValue={barberGroups.map((g) => g.barberKey)}
                      className="space-y-2.5"
                    >
                      {barberGroups.map((group) => {
                        const isAnyBarber =
                          !group.staff || group.barberKey === "any"
                        const groupTotal = group.items.reduce(
                          (sum, { person: p }) => {
                            const pSrv = shop.services.find(
                              (s) => s.id === p.serviceId,
                            )
                            const pAdds = (shop.addons || []).filter((a) =>
                              p.addonIds.includes(a.id),
                            )
                            return (
                              sum +
                              (pSrv?.price || 0) +
                              pAdds.reduce(
                                (addonSum, a) => addonSum + a.price,
                                0,
                              )
                            )
                          },
                          0,
                        )

                        return (
                          <AccordionItem
                            key={group.barberKey}
                            value={group.barberKey}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/15 overflow-hidden shadow-2xs"
                          >
                            <AccordionTrigger className="p-3 hover:bg-[var(--secondary)]/35 transition-colors">
                              <div className="flex items-center justify-between w-full gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {!isAnyBarber && group.staff ? (
                                    <Avatar
                                      size="sm"
                                      className="w-8 h-8 border border-[var(--border)] shrink-0"
                                    >
                                      <AvatarImage
                                        src={group.staff.photo}
                                        alt={group.staff.name}
                                      />
                                      <AvatarFallback className="bg-[var(--secondary)] font-bold text-[10px] text-[var(--foreground)]">
                                        {group.staff.name.slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0">
                                      <IconSparkles size={15} stroke={2} />
                                    </div>
                                  )}
                                  <div className="text-start min-w-0">
                                    <span className="text-xs font-bold text-[var(--foreground)] truncate block">
                                      {!isAnyBarber && group.staff
                                        ? group.staff.name
                                        : T.anyBarber}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-bold text-[var(--primary)]">
                                    {groupTotal} {lang === "ar" ? "د.ل" : "LYD"}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                                  >
                                    {T.count} {group.items.length}
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="p-2.5 pt-0 space-y-2">
                              {group.items.map(({ person: p }, personIdx) => {
                                const pSrv = shop.services.find(
                                  (s) => s.id === p.serviceId,
                                )
                                const pAdds = (shop.addons || []).filter((a) =>
                                  p.addonIds.includes(a.id),
                                )
                                const pCost =
                                  (pSrv?.price || 0) +
                                  pAdds.reduce((s, a) => s + a.price, 0)

                                return (
                                  <div
                                    key={p.id}
                                    className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/60 space-y-1.5 text-xs shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                                        <span className="text-[var(--primary)] font-extrabold">
                                          #{personIdx + 1}
                                        </span>
                                        <span>
                                          {p.isMe ? currentUserName : p.name}
                                        </span>
                                        {p.isMe && (
                                          <Badge
                                            size="sm"
                                            className="bg-[#2F6FA8] text-white py-0 px-1.5 text-[9px] font-bold"
                                          >
                                            {T.you}
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="font-bold text-[var(--primary)]">
                                        {pCost} {lang === "ar" ? "د.ل" : "LYD"}
                                      </span>
                                    </div>
                                    <div className="text-xs space-y-1 text-[var(--muted-foreground)] border-t border-[var(--border)]/60 pt-1.5">
                                      <div className="flex items-center justify-between">
                                        <span>
                                          {lang === "ar"
                                            ? "الخدمة:"
                                            : "Service:"}
                                        </span>
                                        <span className="font-semibold text-[var(--foreground)]">
                                          {lang === "ar"
                                            ? pSrv?.name
                                            : pSrv?.nameEn}{" "}
                                          <span className="text-[var(--foreground)] font-bold">
                                            ({pSrv?.price || 0}{" "}
                                            {lang === "ar" ? "د.ل" : "LYD"})
                                          </span>
                                        </span>
                                      </div>
                                      {pAdds.length > 0 && (
                                        <div className="flex items-start justify-between gap-2 pt-0.5">
                                          <span className="shrink-0">
                                            {lang === "ar"
                                              ? "الإضافات:"
                                              : "Add-ons:"}
                                          </span>
                                          <div className="flex flex-col items-end gap-1">
                                            {pAdds.map((a) => (
                                              <span
                                                key={a.id}
                                                className="font-medium text-[var(--foreground)]"
                                              >
                                                {a.name}{" "}
                                                <span className="text-[var(--foreground)] font-semibold">
                                                  ({a.price}{" "}
                                                  {lang === "ar"
                                                    ? "د.ل"
                                                    : "LYD"}
                                                  )
                                                </span>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                  </div>
                </>
              ) : (
                /* Single person original summary */
                <div className="space-y-2.5 pt-1">
                  {(() => {
                    const singlePerson = persons[0]
                    const singleService =
                      shop.services.find(
                        (s) => s.id === singlePerson?.serviceId,
                      ) || service
                    const singleStaff =
                      shop.staff.find(
                        (st) => st.id === singlePerson?.staffId,
                      ) || chosenStaff
                    const singleAddons = (shop.addons || []).filter((a) =>
                      singlePerson?.addonIds.includes(a.id),
                    )

                    const summaryItems = [
                      {
                        label: T.shop,
                        value: lang === "ar" ? shop.nameAr : shop.name,
                      },
                      {
                        label: T.barber,
                        value: singleStaff?.name ?? T.anyBarber,
                      },
                      {
                        label: T.queuePos,
                        value: singleStaff
                          ? `#${singleStaff.queue + 1}`
                          : T.auto,
                      },
                      {
                        label: T.waitTime,
                        value: singleStaff
                          ? `~${singleStaff.avgWait} ${T.min}`
                          : T.leastWait,
                      },
                      {
                        label: T.service,
                        value: `${
                          lang === "ar"
                            ? singleService.name
                            : singleService.nameEn
                        } — ${singleService.price} ${
                          lang === "ar" ? "د.ل" : "LYD"
                        }`,
                      },
                    ]

                    return (
                      <>
                        {summaryItems.map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-[var(--muted-foreground)]">
                              {label}
                            </span>
                            <span className="font-semibold text-[var(--foreground)]">
                              {value}
                            </span>
                          </div>
                        ))}

                        {singleAddons.length > 0 && (
                          <div className="flex items-start justify-between text-xs">
                            <span className="text-[var(--muted-foreground)] shrink-0">
                              {lang === "ar" ? "الإضافات" : "Add-ons"}
                            </span>
                            <div className="space-y-1.5 text-end">
                              {singleAddons.map((a) => (
                                <div
                                  key={a.id}
                                  className="font-semibold text-[var(--foreground)]"
                                >
                                  {a.name} — {a.price}{" "}
                                  {lang === "ar" ? "د.ل" : "LYD"}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Total & Discount section inside Booking Summary */}
              <div className="border-t border-[var(--border)]/70 pt-3 mt-1 space-y-2">
                {appliedPromo && discount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)] flex items-center gap-1">
                      <IconSparkles
                        size={14}
                        className="text-emerald-500 shrink-0"
                      />
                      <span>{lang === "ar" ? "قيمة الخصم" : "Discount"}</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span>
                        -{discount} {lang === "ar" ? "د.ل" : "LYD"}
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        ({appliedPromo.code})
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted-foreground)]">
                    {lang === "ar"
                      ? "إجمالي الخدمات والإضافات:"
                      : "Services & Add-ons:"}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    {appliedPromo && discount > 0 && (
                      <span className="line-through text-[var(--muted-foreground)] text-xs">
                        {totalBasePrice} {lang === "ar" ? "د.ل" : "LYD"}
                      </span>
                    )}
                    <span className="font-bold text-[var(--foreground)]">
                      {finalPrice} {lang === "ar" ? "د.ل" : "LYD"}
                    </span>
                  </div>
                </div>

                {isClaimedSlot && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]/60">
                    <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <IconBolt
                        size={14}
                        stroke={2.5}
                        className="text-amber-500 shrink-0"
                      />
                      <span>
                        {lang === "ar"
                          ? "شراء مكان محجوز:"
                          : "Reserved Slot Purchase:"}
                      </span>
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      +{depositPaid ?? 5} {lang === "ar" ? "د.ل" : "LYD"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {lang === "ar" ? "المبلغ الإجمالي:" : "Total Price:"}
                  </span>
                  <span className="text-base font-extrabold text-[var(--primary)]">
                    {isClaimedSlot
                      ? finalPrice + (depositPaid ?? 5)
                      : finalPrice}{" "}
                    {lang === "ar" ? "د.ل" : "LYD"}
                  </span>
                </div>

                {isClaimedSlot && (
                  <p className="text-[11px] text-[var(--muted-foreground)] pt-0.5 leading-relaxed">
                    {lang === "ar"
                      ? "💡 تخصم 5 د.ل من محفظتك لشراء المكان المحجوز، ولا تخصم من قيمة الفاتورة."
                      : "💡 5 LYD is deducted from your wallet for slot purchase, not deducted from services."}
                  </p>
                )}
              </div>
            </Card>

            {/* 4. Warning / Disclaimer Notice (التنويه) */}
            <Card
              className="rounded-xl px-4 py-3 text-xs leading-relaxed border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--muted-foreground)]"
              dir={dir}
            >
              {T.cancelWarning(10)}
            </Card>

            {/* 5. Non-fixed Confirm Booking Button at the end of the page (زر تأكيد الحجز) */}
            <div className="pt-2">
              <Button
                size="lg"
                fullWidth
                onClick={() => {
                  // 1. If closed: show closed alert only
                  if (isShopClosed) {
                    setShowClosedAlert(true)
                    return
                  }
                  // 2. Validate that a payment method has been selected
                  if (!payment) {
                    setPaymentError(true)
                    showSnackbar({
                      title:
                        lang === "ar"
                          ? "يجب اختيار طريقة الدفع أولاً"
                          : "Please select a payment method first",
                      type: "warning",
                    })
                    document
                      .getElementById("payment-method-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                    return
                  }

                  const slotFee = isClaimedSlot ? (depositPaid ?? 5) : 0

                  // 3. Balance validations for wallet
                  if (payment === "wallet") {
                    const totalWalletNeeded = finalPrice + slotFee
                    if (walletBalance < totalWalletNeeded) {
                      showSnackbar({
                        title:
                          lang === "ar"
                            ? "رصيد المحفظة غير كافٍ، يرجى شحن المحفظة"
                            : "Insufficient wallet balance, please top up",
                        type: "warning",
                      })
                      setShowTopUpSheet(true)
                      return
                    }
                  } else if (isClaimedSlot && walletBalance < slotFee) {
                    showSnackbar({
                      title:
                        lang === "ar"
                          ? "رصيد المحفظة غير كافٍ لخصم رسوم شراء الدور (5 د.ل)"
                          : "Insufficient wallet balance for slot fee (5 LYD)",
                      type: "warning",
                    })
                    setShowTopUpSheet(true)
                    return
                  }

                  // 4. If claimed slot: show the requested alert dialog!
                  if (isClaimedSlot) {
                    setShowClaimedSlotConfirmAlert(true)
                    return
                  }

                  // 5. If open and cash payment: show cash warning alert
                  if (payment === "cash" && finalPrice > 0) {
                    setShowCashWarningAlert(true)
                    return
                  }

                  // 6. Otherwise: confirm directly
                  executeConfirm()
                }}
                className="h-12 rounded-2xl font-bold shadow-md cursor-pointer"
              >
                {(() => {
                  const total = isClaimedSlot
                    ? finalPrice + (depositPaid ?? 5)
                    : finalPrice
                  return `${T.confirmBtn} (${total} ${
                    lang === "ar" ? "د.ل" : "LYD"
                  })`
                })()}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer for Barber step */}
      {step === "barber" && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 py-4"
          style={{
            background: `linear-gradient(to top, ${C.bg} 70%, transparent)`,
          }}
        >
          <Button
            size="lg"
            fullWidth
            disabled={!selectedStaff}
            onClick={() => {
              if (!selectedStaff) return
              if (addingPersonName) {
                const newPerson: PersonBooking = {
                  id: `person_${Date.now()}`,
                  name: addingPersonName,
                  isMe: false,
                  serviceId: currentServiceId,
                  addonIds: addonIds,
                  staffId: selectedStaff,
                }
                const updated = [...persons, newPerson]
                setPersons(updated)
                if (onUpdatePersons) onUpdatePersons(updated)
                setSelectedStaff(null)
                setStep("group_list")
              } else {
                const updated = persons.map((p) =>
                  p.isMe ? { ...p, staffId: selectedStaff } : p,
                )
                setPersons(updated)
                if (onUpdatePersons) onUpdatePersons(updated)
                setStep("group_list")
              }
            }}
            className="h-12 rounded-2xl font-bold shadow-md cursor-pointer"
          >
            {T.next}
          </Button>
        </div>
      )}

      {/* Action Footer for Group List step */}
      {step === "group_list" && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 py-4 flex items-center justify-between gap-3 border-t border-[var(--border)]/50 shadow-lg"
          style={{
            background: `linear-gradient(to top, ${C.bg} 85%, transparent)`,
          }}
        >
          <Button
            size="lg"
            onClick={() => setStep("confirm")}
            className="h-12 px-6 rounded-2xl font-bold shadow-md cursor-pointer flex-1"
          >
            {T.proceedToConfirmation}
          </Button>
          <div className="text-end shrink-0">
            <p className="text-xs text-[var(--muted-foreground)]">
              {T.totalForGroup}
            </p>
            <p className="text-lg font-bold text-[var(--primary)]">
              {totalBasePrice} {lang === "ar" ? "د.ل" : "LYD"}
            </p>
          </div>
        </div>
      )}

      {/* Reusable Alert Dialog for Closed Shop */}
      <AlertDialog
        open={showClosedAlert}
        onClose={() => setShowClosedAlert(false)}
        type="closed"
        title={T.closedShopAlertTitle}
        confirmText={T.ok}
        dir={dir}
      />

      {/* Reusable Alert Dialog for Cash Payment Warning */}
      <AlertDialog
        open={showCashWarningAlert}
        onClose={() => setShowCashWarningAlert(false)}
        type="warning"
        title={T.cashWarningTitle}
        description={T.cashWarningDesc}
        confirmText={T.agreeAndConfirm}
        cancelText={T.cancel}
        onConfirm={() => {
          setShowCashWarningAlert(false)
          if (isClaimedSlot) {
            setTimeout(() => {
              setShowClaimedSlotQrScanner(true)
            }, 140)
          } else {
            executeConfirm()
          }
        }}
        onCancel={() => setShowCashWarningAlert(false)}
        dir={dir}
      />

      {/* Reusable Alert Dialog for Claimed Slot Confirmation */}
      <AlertDialog
        open={showClaimedSlotConfirmAlert}
        onClose={() => setShowClaimedSlotConfirmAlert(false)}
        type="warning"
        title={lang === "ar" ? "تأكيد حجز الدور" : "Confirm Slot Booking"}
        description={
          lang === "ar"
            ? "بتأكيدك للحجز، فأنت توافق على خصم قيمة 5 دينار مقابل شراء المكان المحجوز."
            : "By confirming the booking, you agree to the deduction of 5 LYD for purchasing the reserved slot."
        }
        confirmText={lang === "ar" ? "موافق" : "Agree"}
        cancelText={lang === "ar" ? "إلغاء" : "Cancel"}
        onConfirm={() => {
          setShowClaimedSlotConfirmAlert(false)
          if (payment === "cash" && finalPrice > 0) {
            setTimeout(() => {
              setShowCashWarningAlert(true)
            }, 140)
          } else {
            setTimeout(() => {
              setShowClaimedSlotQrScanner(true)
            }, 140)
          }
        }}
        onCancel={() => setShowClaimedSlotConfirmAlert(false)}
        dir={dir}
      />

      {/* Reusable QR Scanner BottomSheet for claimed slot arrival verification */}
      <QrScannerBottomSheet
        open={showClaimedSlotQrScanner}
        onClose={() => setShowClaimedSlotQrScanner(false)}
        shopName={lang === "ar" ? shop.nameAr : shop.name}
        title={
          lang === "ar"
            ? "مسح QR المركز لتأكيد الحضور"
            : "Scan Salon QR to Confirm Presence"
        }
        description={
          lang === "ar"
            ? `وجّه الكاميرا نحو رمز QR المعروض داخل ${shop.nameAr} للتحقق من تواجدك بالمركز وتأكيد شراء الدور`
            : `Align camera with the QR code inside ${shop.name} to verify arrival and claim the slot`
        }
        successMessage={
          lang === "ar"
            ? "تم التحقق من حضورك بالمركز بنجاح!"
            : "Presence Verified In-Shop!"
        }
        lang={lang}
        dir={dir}
        onScanSuccess={() => {
          setShowClaimedSlotQrScanner(false)
          executeConfirm()
        }}
      />

      {/* Add Person Bottom Sheet (نافذة سفلية لإدخال اسم الشخص المرافق) */}
      <BottomSheet
        open={showAddPersonModal}
        onClose={() => {
          setShowAddPersonModal(false)
          setNameError("")
        }}
        title={T.addPerson}
        dir={dir}
      >
        <div className="space-y-4 pt-1" dir={dir}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)] block">
              {T.enterPersonName} <span className="text-rose-500">*</span>
            </label>
            <input
              ref={personInputRef}
              type="text"
              value={newPersonName}
              onChange={(e) => {
                setNewPersonName(e.target.value)
                if (nameError) setNameError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStartAddPerson()
              }}
              placeholder={T.personNamePlaceholder}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-[var(--foreground)] bg-[var(--card)] focus:outline-none transition-all ${
                nameError
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
              }`}
            />
            {nameError && (
              <p className="text-xs text-rose-500 font-semibold px-1">
                {nameError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 pb-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddPersonModal(false)
                setNameError("")
              }}
              className="rounded-xl h-11"
            >
              {T.cancel}
            </Button>
            <Button
              fullWidth
              onClick={handleStartAddPerson}
              className="rounded-xl h-11 font-bold"
            >
              {T.next}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Service & Add-ons Selection Bottom Sheet */}
      {editingPerson && (
        <ServiceSelectionBottomSheet
          open={!!editingPerson}
          onClose={() => setEditingPerson(null)}
          onConfirm={({ serviceId, addonIds, name }) => {
            const finalName = editingPerson.isMe
              ? currentUserName
              : (name || "").trim()

            const updated = persons.map((p) =>
              p.id === editingPerson.id
                ? {
                    ...p,
                    name: finalName,
                    serviceId,
                    addonIds,
                  }
                : p,
            )

            setPersons(updated)
            if (onUpdatePersons) onUpdatePersons(updated)
            setEditingPerson(null)

            if (isClaimedSlot) {
              setStep("confirm")
            }

            showSnackbar({
              title:
                lang === "ar"
                  ? isClaimedSlot
                    ? "تم تحديد الخدمات بنجاح — إليك الفاتورة النهائية"
                    : editingPerson.isMe
                      ? "تم حفظ تعديلات حجزك بنجاح"
                      : `تم حفظ تعديلات ${finalName} بنجاح`
                  : isClaimedSlot
                    ? "Services selected — Here is your invoice"
                    : editingPerson.isMe
                      ? "Your booking changes have been saved successfully"
                      : `Changes for ${finalName} saved successfully`,
              type: "success",
            })
          }}
          title={
            isClaimedSlot
              ? lang === "ar"
                ? "تحديد الخدمة والإضافات"
                : "Select Service & Add-ons"
              : editingPerson.isMe
                ? lang === "ar"
                  ? "تعديل خيارات حجزك"
                  : "Edit Your Booking Options"
                : lang === "ar"
                  ? `تعديل حجز (${editingPerson.name || ""})`
                  : `Edit Booking for ${editingPerson.name || ""}`
          }
          confirmText={
            isClaimedSlot
              ? lang === "ar"
                ? "تأكيد ومتابعة للفاتورة"
                : "Confirm & View Invoice"
              : lang === "ar"
                ? "حفظ التعديلات"
                : "Save Changes"
          }
          totalLabel={lang === "ar" ? "الإجمالي:" : "Total:"}
          showNameInput={!editingPerson.isMe}
          services={shop.services}
          addons={shop.addons}
          initialServiceId={editingPerson.serviceId}
          initialAddonIds={editingPerson.addonIds}
          initialName={
            editingPerson.isMe ? currentUserName : editingPerson.name
          }
          initialStaffId={editingPerson.staffId}
          existingNames={persons
            .filter((p) => p.id !== editingPerson.id)
            .map((p) => p.name)}
          lang={lang}
          dir={dir}
        />
      )}

      {/* 6. Wallet Top-up Bottom Sheet (شحن المحفظة) */}
      <BottomSheet
        open={showTopUpSheet}
        onClose={() => {
          setShowTopUpSheet(false)
          setSelectedTopUpProvider(null)
          setTopUpAmountInput("")
        }}
        title={
          selectedTopUpProvider
            ? lang === "ar"
              ? "تحديد مبلغ الشحن"
              : "Enter Top-up Amount"
            : lang === "ar"
              ? "شحن رصيد المحفظة"
              : "Top Up Wallet Balance"
        }
        description={
          selectedTopUpProvider
            ? lang === "ar"
              ? "أدخل القيمة المراد إضافتها إلى محفظتك"
              : "Enter the amount to add to your wallet"
            : lang === "ar"
              ? "اختر طريقة الدفع للمتابعة"
              : "Select a payment method to proceed"
        }
        dir={dir}
      >
        <div className="py-2" dir={dir}>
          {!selectedTopUpProvider ? (
            /* Step 1: Payment Methods Selection Only */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
                {lang === "ar"
                  ? "وسائل الدفع المتاحة"
                  : "Available Payment Methods"}
              </label>

              {/* ONEPAY Option */}
              <button
                type="button"
                onClick={() => setSelectedTopUpProvider("onepay")}
                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-[var(--secondary)]/40 border border-[var(--border)]/70 bg-[var(--card)]"
              >
                <div className="text-[var(--muted-foreground)]">
                  {dir === "rtl" ? (
                    <IconChevronLeft size={18} stroke={2} />
                  ) : (
                    <IconChevronRight size={18} stroke={2} />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <span className="text-sm font-bold text-[var(--foreground)] block">
                      ONEPAY (وان باي)
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {lang === "ar"
                        ? "الدفع الفوري السريع"
                        : "Fast instant payment"}
                    </span>
                  </div>

                  <div className="w-12 h-10 rounded-xl bg-black flex items-center justify-center p-1 border border-zinc-800 shadow-2xs flex-shrink-0">
                    <img
                      src={onepayLogo}
                      alt="ONEPAY"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </button>

              {/* LYPAY Option */}
              <button
                type="button"
                onClick={() => setSelectedTopUpProvider("lypay")}
                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-[var(--secondary)]/40 border border-[var(--border)]/70 bg-[var(--card)]"
              >
                <div className="text-[var(--muted-foreground)]">
                  {dir === "rtl" ? (
                    <IconChevronLeft size={18} stroke={2} />
                  ) : (
                    <IconChevronRight size={18} stroke={2} />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <span className="text-sm font-bold text-[var(--foreground)] block">
                      LYPAY (لي باي)
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {lang === "ar"
                        ? "الدفع الإلكتروني عبر لي باي"
                        : "Direct LYPAY payment"}
                    </span>
                  </div>

                  <div className="w-12 h-10 rounded-xl bg-[#0b2444] flex items-center justify-center p-1 border border-[#1b3d6c] shadow-2xs flex-shrink-0">
                    <img
                      src={lypayLogo}
                      alt="LYPAY"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Step 2: Custom Amount Input & Confirm Button */
            <div className="space-y-4">
              {/* Selected Method Summary Box */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-8 rounded-xl flex items-center justify-center p-1 border shadow-2xs flex-shrink-0 ${
                      selectedTopUpProvider === "onepay"
                        ? "bg-black border-zinc-800"
                        : "bg-[#0b2444] border-[#1b3d6c]"
                    }`}
                  >
                    <img
                      src={
                        selectedTopUpProvider === "onepay"
                          ? onepayLogo
                          : lypayLogo
                      }
                      alt={
                        selectedTopUpProvider === "onepay" ? "ONEPAY" : "LYPAY"
                      }
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--foreground)] block">
                      {selectedTopUpProvider === "onepay"
                        ? "ONEPAY (وان باي)"
                        : "LYPAY (لي باي)"}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "ar"
                        ? "طريقة الدفع المختارة"
                        : "Selected payment method"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTopUpProvider(null)}
                  className="text-xs font-bold text-[var(--primary)] hover:underline px-2 py-1 rounded-lg hover:bg-[var(--primary)]/10 transition-colors cursor-pointer"
                >
                  {lang === "ar" ? "تغيير" : "Change"}
                </button>
              </div>

              {/* Amount Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]">
                  {lang === "ar" ? "قيمة الشحن المطلوبة" : "Top-up Amount"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    autoFocus
                    value={topUpAmountInput}
                    onChange={(e) => setTopUpAmountInput(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "أدخل القيمة بالدينار..."
                        : "Enter amount in LYD..."
                    }
                    className="w-full h-12 px-4 pe-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-base font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)]"
                    dir={dir}
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--muted-foreground)] pointer-events-none">
                    {lang === "ar" ? "د.ل" : "LYD"}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                size="default"
                fullWidth
                disabled={!isValidTopUpAmount}
                onClick={handleConfirmTopUp}
                className="h-11 rounded-2xl font-bold cursor-pointer transition-all shadow-xs mt-2"
              >
                {lang === "ar"
                  ? isValidTopUpAmount
                    ? `تأكيد شحن ${parsedTopUpAmount} د.ل`
                    : "تأكيد الشحن"
                  : isValidTopUpAmount
                    ? `Confirm ${parsedTopUpAmount} LYD`
                    : "Confirm Top-up"}
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
