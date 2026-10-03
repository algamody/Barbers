import { useState, useEffect, useRef, useMemo } from "react"
import { MY_BOOKING, SHOPS } from "../data"
import { getC, Theme } from "../theme"
import { Lang, useT } from "../i18n"
import { Button, Card, Badge, BottomSheet, showSnackbar } from "@/components/ui"
import {
  IconX,
  IconCheck,
  IconScissors,
  IconUser,
  IconQrcode,
  IconScan,
  IconMapPin,
} from "@tabler/icons-react"
import {
  ReviewBottomSheet,
  QrScannerBottomSheet,
} from "@/components/bottom-sheets"
import barberChairImg from "@/public/barber-chair-transparent.png"
import { GroupBookingData, GroupBookingPerson } from "../types/booking"

interface Props {
  theme: Theme
  lang: Lang
  onClose: () => void
  selectedStaffId?: string | null
}

export default function MyQueue({
  theme,
  lang,
  onClose,
  selectedStaffId,
}: Props) {
  const C = getC(theme)
  const T = useT(lang)
  const dir = lang === "ar" ? "rtl" : "ltr"

  // Check if there is an active group booking in localStorage
  const [activeGroupBooking] = useState<GroupBookingData | null>(() => {
    try {
      const saved = localStorage.getItem("active_group_booking")
      if (saved) {
        const parsed = JSON.parse(saved) as GroupBookingData
        if (parsed && Array.isArray(parsed.persons)) {
          if (!parsed.attendanceConfirmed) {
            parsed.persons = parsed.persons.map((p) => ({
              ...p,
              confirmed: true,
            }))
            try {
              localStorage.setItem(
                "active_group_booking",
                JSON.stringify(parsed),
              )
            } catch {}
          }
        }
        return parsed
      }
    } catch {}
    return null
  })

  const effectiveStaffId =
    selectedStaffId ??
    (() => {
      try {
        return localStorage.getItem("selected_queue_staff_id")
      } catch {}
      return null
    })()

  const booking = activeGroupBooking || MY_BOOKING

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

  // All persons in this booking
  const allPersons: GroupBookingPerson[] = useMemo(() => {
    return (
      activeGroupBooking?.persons || [
        {
          id: "me",
          name: currentUserName,
          isMe: true,
          serviceId: "srv-1",
          serviceName: MY_BOOKING.service,
          addonIds: [],
          addonNames: [MY_BOOKING.addons],
          staffId: "st-1",
          staffName: MY_BOOKING.staffName,
          price: 25,
          confirmed: true,
        },
      ]
    )
  }, [activeGroupBooking, currentUserName])

  // Persons for the currently selected barber queue
  const currentPersons: GroupBookingPerson[] = useMemo(() => {
    if (!effectiveStaffId || !activeGroupBooking?.persons) {
      return allPersons
    }
    const filtered = activeGroupBooking.persons.filter(
      (p) => (p.staffId || "any") === effectiveStaffId,
    )
    return filtered.length > 0 ? filtered : allPersons
  }, [allPersons, activeGroupBooking, effectiveStaffId])

  // Barber name for this queue
  const currentStaffName = useMemo(() => {
    if (currentPersons.length > 0 && currentPersons[0].staffName) {
      return currentPersons[0].staffName
    }
    return booking.staffName
  }, [currentPersons, booking.staffName])

  const [showAttendanceSheet, setShowAttendanceSheet] = useState(false)

  const currentShop = useMemo(() => {
    return (
      SHOPS.find((s) => s.id === activeGroupBooking?.shopId) ||
      SHOPS.find(
        (s) => s.name === booking.shopName || s.nameAr === booking.shopName,
      ) ||
      SHOPS[0]
    )
  }, [activeGroupBooking, booking.shopName])

  // Check if booking is already confirmed (e.g., claimed slot / took turn or pre-confirmed attendance)
  const isPreConfirmed = !!(
    activeGroupBooking?.attendanceConfirmed ||
    activeGroupBooking?.isClaimedSlot ||
    (booking as any)?.attendanceConfirmed ||
    (booking as any)?.isClaimedSlot
  )

  // Per-person confirmation state (individual attendance)
  const [confirmedPersons, setConfirmedPersons] =
    useState<Record<string, boolean>>(() => {
      const init: Record<string, boolean> = {}
      const isExplicitlyConfirmed =
        activeGroupBooking?.attendanceConfirmed ||
        activeGroupBooking?.isClaimedSlot
      currentPersons.forEach((p) => {
        init[p.id] =
          isExplicitlyConfirmed || p.confirmed !== undefined
            ? !!p.confirmed
            : true
      })
      return init
    })

  const togglePersonConfirm = (personId: string) => {
    setConfirmedPersons((prev) => ({
      ...prev,
      [personId]: !prev[personId],
    }))
  }

  const confirmedCount = currentPersons.filter(
    (p) => !!confirmedPersons[p.id],
  ).length

  const [status, setStatus] =
    useState<"in_queue" | "next_up" | "in_progress" | "completed">(
      booking.status,
    )
  const [currentChairPersonIndex, setCurrentChairPersonIndex] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [countdown, setCountdown] = useState(10 * 60)
  const [confirmed, setConfirmed] = useState(isPreConfirmed)
  const [showShopQrScanner, setShowShopQrScanner] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (
      activeGroupBooking?.attendanceConfirmed ||
      activeGroupBooking?.isClaimedSlot
    ) {
      setConfirmed(true)
    }
  }, [activeGroupBooking])

  const handleQrScanSuccess = () => {
    setConfirmed(true)
    if (activeGroupBooking) {
      try {
        const updatedPersons = activeGroupBooking.persons.map((p) => {
          if (confirmedPersons[p.id] !== undefined) {
            return { ...p, confirmed: confirmedPersons[p.id] }
          }
          return p
        })
        localStorage.setItem(
          "active_group_booking",
          JSON.stringify({
            ...activeGroupBooking,
            attendanceConfirmed: true,
            persons: updatedPersons,
          }),
        )
      } catch {}
    }

    setShowShopQrScanner(false)
    showSnackbar({
      title:
        lang === "ar"
          ? `تم مسح QR ${booking.shopName} بنجاح!`
          : `Successfully scanned ${booking.shopName} QR!`,
      type: "success",
    })
  }

  useEffect(() => {
    if (status !== "next_up" || confirmed) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(
      () => setCountdown((c) => (c > 0 ? c - 1 : 0)),
      1000,
    )
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status, confirmed])

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  useEffect(() => {
    if (status === "completed") {
      const timer = setTimeout(() => setShowReview(true), 400)
      return () => clearTimeout(timer)
    }
  }, [status])

  const advance = () => {
    if (status === "in_queue") setStatus("next_up")
    else if (status === "next_up" && confirmed) {
      setStatus("in_progress")
      setCurrentChairPersonIndex(0)
    } else if (status === "in_progress") {
      if (currentChairPersonIndex < effectivePersons.length - 1) {
        setCurrentChairPersonIndex((prev) => prev + 1)
      } else {
        setStatus("completed")
        setTimeout(() => setShowReview(true), 600)
      }
    }
  }

  // Determine if queue exists (can be empty if shop is not crowded)
  const hasQueue =
    booking.position > 1 || booking.totalAhead > 0 || status === "in_queue"

  const queueSteps = hasQueue
    ? [
        {
          id: "in_queue",
          label: lang === "ar" ? "في الطابور" : "In Queue",
        },
        {
          id: "next_up",
          label: confirmed
            ? lang === "ar"
              ? "استرح حتى دورك"
              : "Relax"
            : lang === "ar"
              ? "للتأكيد"
              : "Confirmation",
        },
        {
          id: "in_progress",
          label: lang === "ar" ? "جارٍ" : "In Progress",
        },
        {
          id: "completed",
          label: lang === "ar" ? "مكتمل" : "Completed",
        },
      ]
    : [
        {
          id: "next_up",
          label: confirmed
            ? lang === "ar"
              ? "استرح حتى دورك"
              : "Relax"
            : lang === "ar"
              ? "للتأكيد"
              : "Confirmation",
        },
        {
          id: "in_progress",
          label: lang === "ar" ? "جارٍ" : "In Progress",
        },
        {
          id: "completed",
          label: lang === "ar" ? "مكتمل" : "Completed",
        },
      ]

  const currentStepIdx = queueSteps.findIndex((s) => s.id === status)
  const activeStepIdx = currentStepIdx >= 0 ? currentStepIdx : 0
  const currentStatusTitle =
    status === "next_up" && confirmed
      ? lang === "ar"
        ? "استرح حتى يصل دورك"
        : "Relax Until Your Turn"
      : queueSteps[activeStepIdx]?.label || ""

  const isMeInChair = status === "in_progress"

  const effectivePersons = useMemo(() => {
    return confirmed
      ? currentPersons.filter((p) => !!confirmedPersons[p.id])
      : currentPersons
  }, [confirmed, currentPersons, confirmedPersons])

  const activeChairIdx = Math.min(
    currentChairPersonIndex,
    Math.max(0, effectivePersons.length - 1),
  )

  const chairPerson = isMeInChair
    ? effectivePersons[activeChairIdx] || currentPersons[0]
    : effectivePersons[0] || currentPersons[0]

  const isGroupWithSameBarber = currentPersons.length > 1

  const chairPersonName = chairPerson?.isMe
    ? lang === "ar"
      ? "أنت"
      : "You"
    : chairPerson?.name === "أنت" || chairPerson?.name === "You"
      ? currentUserName
      : chairPerson?.name || (lang === "ar" ? "أنت" : "You")

  const chairSlotLabel = useMemo(() => {
    if (isGroupWithSameBarber) {
      const pIdx = currentPersons.findIndex((p) => p.id === chairPerson?.id)
      const num = pIdx >= 0 ? pIdx + 1 : 1
      return `${num}`
    }
    return lang === "ar" ? "أنت" : "You"
  }, [isGroupWithSameBarber, currentPersons, chairPerson, lang])

  interface QueueSlot {
    type: "group" | "other" | "empty"
    label?: string
  }

  interface QueueData {
    pills: QueueSlot[]
    aheadOverflow: number
    behindOverflow: number
  }

  const queueData = useMemo<QueueData>(() => {
    const MAX_MARKS = 6

    // Persons from effectivePersons that are in the queue line (behind the chair)
    const groupInQueue = isMeInChair
      ? effectivePersons.slice(activeChairIdx + 1)
      : effectivePersons

    // How many other people are ahead of our group in the line
    let aheadCount = 0
    if (status === "in_queue") {
      aheadCount = Math.max(1, (booking.position || 2) - 1)
    } else if (status === "next_up") {
      aheadCount = 0
    } else if (status === "in_progress") {
      aheadCount = 0
    }

    const realPeopleCount = aheadCount + groupInQueue.length

    // If total real people < MAX_MARKS, allow up to 2 dummy slots behind (1 other, 1 empty)
    const dummyBehindCount =
      realPeopleCount < MAX_MARKS ? Math.min(2, MAX_MARKS - realPeopleCount) : 0

    const totalCount = realPeopleCount + dummyBehindCount

    // Case 1: Total items <= MAX_MARKS -> everything fits without overflow
    if (totalCount <= MAX_MARKS) {
      const pills: QueueSlot[] = []
      for (let i = 0; i < aheadCount; i++) {
        pills.push({ type: "other" })
      }
      for (let i = 0; i < groupInQueue.length; i++) {
        const person = groupInQueue[i]
        let label: string
        if (isGroupWithSameBarber) {
          const pIdx = currentPersons.findIndex((p) => p.id === person.id)
          const num = pIdx >= 0 ? pIdx + 1 : i + 1
          label = `${num}`
        } else {
          label = lang === "ar" ? "أنت" : "You"
        }
        pills.push({ type: "group", label })
      }
      if (dummyBehindCount > 0) {
        pills.push({ type: "other" })
        if (dummyBehindCount > 1) {
          pills.push({ type: "empty" })
        }
      }
      return { pills, aheadOverflow: 0, behindOverflow: 0 }
    }

    // Case 2: Total items > MAX_MARKS -> strictly cap visible pills to MAX_MARKS (6)
    let visibleAhead = 0
    let aheadOverflow = 0

    if (aheadCount > 0) {
      if (aheadCount > 2 || groupInQueue.length >= MAX_MARKS - 1) {
        visibleAhead = 1
        aheadOverflow = aheadCount - 1
      } else {
        visibleAhead = Math.min(aheadCount, MAX_MARKS - 1)
        aheadOverflow = aheadCount - visibleAhead
      }
    }

    const availableForGroup = MAX_MARKS - visibleAhead
    const visibleGroupCount = Math.min(groupInQueue.length, availableForGroup)
    const groupOverflow = groupInQueue.length - visibleGroupCount

    const pills: QueueSlot[] = []

    // 1. Visible ahead pills
    for (let i = 0; i < visibleAhead; i++) {
      pills.push({ type: "other" })
    }

    // 2. Visible group pills (up to available space)
    for (let i = 0; i < visibleGroupCount; i++) {
      const person = groupInQueue[i]
      let label: string
      if (isGroupWithSameBarber) {
        const pIdx = currentPersons.findIndex((p) => p.id === person.id)
        const num = pIdx >= 0 ? pIdx + 1 : i + 1
        label = `${num}`
      } else {
        label = lang === "ar" ? "أنت" : "You"
      }
      pills.push({ type: "group", label })
    }

    // 3. Optional behind dummy slots only if group didn't overflow and space remains
    let visibleDummyBehind = 0
    if (groupOverflow === 0) {
      const remainingSlots = MAX_MARKS - visibleAhead - visibleGroupCount
      visibleDummyBehind = Math.min(dummyBehindCount, remainingSlots)
      if (visibleDummyBehind > 0) {
        pills.push({ type: "other" })
        if (visibleDummyBehind > 1) {
          pills.push({ type: "empty" })
        }
      }
    }

    const behindOverflow =
      groupOverflow + (dummyBehindCount - visibleDummyBehind)

    return { pills, aheadOverflow, behindOverflow }
  }, [
    isMeInChair,
    effectivePersons,
    activeChairIdx,
    status,
    booking.position,
    lang,
    isGroupWithSameBarber,
    currentPersons,
  ])

  const headerPosition = useMemo(() => {
    if (status === "in_progress") {
      return {
        number: lang === "ar" ? "الآن" : "Now",
        label: lang === "ar" ? "على كرسي الحلاقة" : "In the chair",
      }
    }
    if (status === "next_up") {
      return {
        number: "#1",
        label: confirmed
          ? lang === "ar"
            ? "استرح حتى يصل دورك"
            : "Relax until your turn"
          : lang === "ar"
            ? "أنت التالي!"
            : "You're next!",
      }
    }
    if (status === "completed") {
      return {
        number: "✓",
        label: lang === "ar" ? "مكتمل" : "Completed",
      }
    }
    return {
      number: `#${booking.position}`,
      label: T.queuePosition,
    }
  }, [status, booking.position, lang, T.queuePosition, confirmed])

  const formattedWaitDuration = useMemo(() => {
    if (status !== "in_queue") {
      return null
    }
    const m = Number(booking.estimatedWait) || 0
    if (m <= 0) return null
    if (m < 60) {
      return lang === "ar" ? `${m} دقيقة` : `${m} min`
    }
    const hours = Math.floor(m / 60)
    const remainingMins = m % 60

    if (lang === "ar") {
      const hoursText = `${hours} ساعة`
      if (remainingMins === 0) {
        return hoursText
      }
      return `${hoursText} و ${remainingMins} دقيقة`
    } else {
      if (remainingMins === 0) {
        return `${hours}h`
      }
      return `${hours}h ${remainingMins}m`
    }
  }, [status, booking.estimatedWait, lang])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header with close button, current status title, and step progress indicator */}
      <div
        className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-[var(--border)]"
        dir={dir}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onClose}
            className="rounded-full text-xs font-semibold cursor-pointer hover:bg-[var(--secondary)] shrink-0"
          >
            <IconX size={15} stroke={2.5} />
          </Button>
          <h2
            className="text-lg font-light text-[var(--foreground)] truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentStatusTitle}
          </h2>
        </div>

        {/* Progress pills indicator */}
        <div className="flex gap-1.5 shrink-0 items-center">
          {queueSteps.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeStepIdx >= idx ? 16 : 6,
                height: 6,
                backgroundColor: activeStepIdx >= idx ? C.gold : C.border,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 space-y-4">
        {/* Main queue card using unified Card */}
        {/* Main queue card using unified Card */}
        <Card
          className="rounded-3xl px-5 py-6 border-[var(--border)] bg-[var(--card)] space-y-4"
          dir={dir}
        >
          {status === "completed" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500/15 border-2 border-emerald-500">
                <IconCheck size={32} stroke={3} className="text-emerald-500" />
              </div>
              <p
                className="text-lg font-light text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {T.visitComplete}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {T.hopeSatisfied}
              </p>
              <Button
                size="default"
                className="mt-2 rounded-full cursor-pointer font-semibold"
                onClick={() => setShowReview(true)}
              >
                {T.leaveReview}
              </Button>
            </div>
          ) : (
            <>
              {/* Header with Position and Wait Time (Always Centered) */}
              <div className="text-center space-y-0.5">
                <p
                  className="text-4xl font-light text-[var(--foreground)] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {headerPosition.number}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <span>{headerPosition.label}</span>
                  {formattedWaitDuration && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="font-semibold text-[var(--primary)]">
                        {formattedWaitDuration}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Queue visualization with barber chair at the head */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* Barber cutting hair in chair */}
                  <div
                    className="relative shrink-0 flex flex-col items-center justify-center pt-3.5"
                    title={
                      lang === "ar"
                        ? isMeInChair
                          ? isGroupWithSameBarber
                            ? `الشخص #${chairSlotLabel} (${chairPersonName}) على كرسي الحلاقة الآن`
                            : "أنت على كرسي الحلاقة الآن"
                          : "على كرسي الحلاقة الآن"
                        : isMeInChair
                          ? isGroupWithSameBarber
                            ? `Person #${chairSlotLabel} (${chairPersonName}) is in the barber chair`
                            : "You are in the barber chair"
                          : "Currently in the barber chair"
                    }
                  >
                    {isMeInChair && (
                      <span className="absolute top-0 text-[10px] font-bold text-[#2F6FA8] select-none leading-none whitespace-nowrap">
                        {chairSlotLabel}
                      </span>
                    )}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2 transition-all ${
                        isMeInChair
                          ? "bg-[#2F6FA8]/15 border border-[#2F6FA8]/30 shadow-xs"
                          : "bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15"
                      }`}
                    >
                      <div
                        className="w-8 h-8 transition-colors animate-pulse"
                        style={{
                          backgroundColor: isMeInChair ? "#2F6FA8" : C.gold,
                          maskImage: `url(${barberChairImg})`,
                          WebkitMaskImage: `url(${barberChairImg})`,
                          maskSize: "contain",
                          WebkitMaskSize: "contain",
                          maskRepeat: "no-repeat",
                          WebkitMaskRepeat: "no-repeat",
                          maskPosition: "center",
                          WebkitMaskPosition: "center",
                          transform: dir === "rtl" ? "scaleX(-1)" : "none",
                          WebkitTransform:
                            dir === "rtl" ? "scaleX(-1)" : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Progress pills for the queue with names strictly above slots */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 pt-3.5">
                      {queueData.aheadOverflow > 0 && (
                        <span
                          dir="ltr"
                          className="shrink-0 text-xs font-bold text-[var(--muted-foreground)] select-none leading-none px-1"
                          title={
                            lang === "ar"
                              ? `${queueData.aheadOverflow} أشخاص إضافيون في الأمام`
                              : `${queueData.aheadOverflow} more ahead in queue`
                          }
                        >
                          +{queueData.aheadOverflow}
                        </span>
                      )}

                      {queueData.pills.map((slot, i) => {
                        const colorOther =
                          theme === "dark" ? "#5a5a5a" : "#b8b8b8"
                        const colorDashed =
                          theme === "dark" ? "#3f3f46" : "#d1d5db"

                        return (
                          <div
                            key={i}
                            className="flex-1 relative flex flex-col items-center"
                          >
                            {slot.label && (
                              <span className="absolute -top-3.5 text-[10px] font-bold select-none leading-none whitespace-nowrap text-[#2F6FA8]">
                                {slot.label}
                              </span>
                            )}
                            <div
                              className="w-full h-2.5 rounded-full transition-all"
                              style={{
                                backgroundColor:
                                  slot.type === "group"
                                    ? "#2F6FA8"
                                    : slot.type === "other"
                                      ? colorOther
                                      : "transparent",
                                border:
                                  slot.type === "empty"
                                    ? `1.5px dashed ${colorDashed}`
                                    : "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        )
                      })}

                      {queueData.behindOverflow > 0 && (
                        <span
                          dir="ltr"
                          className="shrink-0 text-xs font-bold text-[var(--muted-foreground)] select-none leading-none px-1"
                          title={
                            lang === "ar"
                              ? `${queueData.behindOverflow} خانات إضافية في الخلف`
                              : `${queueData.behindOverflow} more behind in queue`
                          }
                        >
                          +{queueData.behindOverflow}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status-specific: in next_up show timer card as it was under the queue visualization */}
              {status === "next_up" && (
                <div className="pt-2 space-y-3">
                  {confirmed ? (
                    <div className="space-y-2">
                      <div className="py-4 px-4 rounded-2xl text-center bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center gap-2.5 shadow-2xs">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <IconCheck size={18} stroke={3} />
                        </div>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {lang === "ar"
                            ? "تم تأكيد الحضور، يمكنك الاستراحة حتى يصل دورك"
                            : "Attendance confirmed, you can relax until your turn arrives"}
                        </span>
                      </div>
                      {/*{currentPersons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowAttendanceSheet(true)}
                          className="w-full text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline cursor-pointer py-1"
                        >
                          {lang === "ar" ? "تعديل الحضور" : "Edit Attendance"}
                        </button>
                      )}*/}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Timer card as it was */}
                      <Card className="rounded-2xl px-4 py-4 text-center bg-[var(--primary)]/10 border-[var(--primary)]/30">
                        <p className="text-xs tracking-widest uppercase mb-2 text-[var(--primary)] font-semibold">
                          {T.youreNext}
                        </p>
                        <p
                          className="text-3xl font-light mb-1 text-[var(--foreground)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {String(mins).padStart(2, "0")}:
                          {String(secs).padStart(2, "0")}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {T.timeLeft}
                        </p>
                      </Card>

                      {currentPersons.length > 1 ? (
                        <Button
                          size="lg"
                          fullWidth
                          onClick={() => setShowAttendanceSheet(true)}
                          className="rounded-2xl font-bold shadow-md cursor-pointer h-12"
                        >
                          {lang === "ar"
                            ? `تأكيد حضور (${confirmedCount} محدد)`
                            : `Confirm Attendance (${confirmedCount} selected)`}
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          fullWidth
                          onClick={() => {
                            setShowShopQrScanner(true)
                          }}
                          className="rounded-2xl font-bold shadow-md cursor-pointer h-12"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <IconScan size={18} stroke={2.2} />
                            <span>{T.confirmAttendance}</span>
                          </div>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {status === "in_progress" && (
                <div className="pt-2">
                  <div className="py-3 px-4 rounded-2xl text-center bg-[#2F6FA8]/10 border border-[#2F6FA8]/25 flex items-center justify-center gap-2.5 shadow-2xs">
                    <div className="w-7 h-7 rounded-full bg-[#2F6FA8]/20 text-[#2F6FA8] flex items-center justify-center shrink-0 animate-pulse">
                      <IconScissors size={16} stroke={2.2} />
                    </div>
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {chairPerson?.isMe
                        ? T.yourTurnWith(currentStaffName)
                        : lang === "ar"
                          ? `دور ${chairPersonName} الآن عند ${currentStaffName}`
                          : `${chairPersonName}'s turn with ${currentStaffName}`}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Booking details card */}
        <Card
          className="rounded-2xl px-4 py-4 space-y-3 border-[var(--border)] bg-[var(--card)]"
          dir={dir}
        >
          {[
            {
              label: lang === "ar" ? "المحل" : "Shop",
              value: booking.shopName,
            },
            {
              label: lang === "ar" ? "الحلاق" : "Barber",
              value: currentStaffName,
            },
            {
              label: lang === "ar" ? "رقم الحجز" : "Booking ID",
              value: booking.bookingId,
            },
            {
              label: lang === "ar" ? "طريقة الدفع" : "Payment Method",
              value:
                booking.paymentMethod === "wallet"
                  ? lang === "ar"
                    ? "💳 المحفظة"
                    : "💳 Wallet"
                  : lang === "ar"
                    ? "💵 نقداً"
                    : "💵 Cash",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-[var(--muted-foreground)]">{label}</span>
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {value}
              </span>
            </div>
          ))}

          {/* Individual Person Details Cards (Like Booking Summary) */}
          <div className="border-t border-[var(--border)]/60 pt-3 space-y-2.5">
            {currentPersons.length > 1 && (
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {lang === "ar" ? "الأشخاص في الحجز:" : "Persons in Booking:"}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-1.5 py-0"
                >
                  {T.count} {currentPersons.length}
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              {currentPersons.map((p, personIdx) => {
                const pSrv =
                  currentShop.services.find((s) => s.id === p.serviceId) ||
                  currentShop.services.find(
                    (s) =>
                      s.name === p.serviceName || s.nameEn === p.serviceName,
                  )
                const matchedAddons = (currentShop.addons || []).filter((a) =>
                  (p.addonIds || []).includes(a.id),
                )
                const resolvedAddons: {
                  id: string
                  name: string
                  price: number
                }[] =
                  matchedAddons.length > 0
                    ? matchedAddons.map((a) => ({
                        id: a.id,
                        name: a.name,
                        price: a.price,
                      }))
                    : (p.addonNames || []).map((name, idx) => {
                        const shopAddon = (currentShop.addons || []).find(
                          (sa) =>
                            sa.name === name || (sa as any).nameAr === name,
                        )
                        return {
                          id: shopAddon?.id || `add_${idx}`,
                          name: shopAddon?.name || name,
                          price: shopAddon?.price ?? 4,
                        }
                      })

                const totalAddonsPrice = resolvedAddons.reduce(
                  (sum, a) => sum + (a.price || 0),
                  0,
                )
                const servicePrice =
                  pSrv?.price ??
                  (p.price != null && p.price > 0
                    ? Math.max(0, p.price - totalAddonsPrice)
                    : 25)
                const pCost = p.price || servicePrice + totalAddonsPrice

                const displayName = p.isMe
                  ? p.name === "أنت" || p.name === "You"
                    ? currentUserName
                    : p.name
                  : p.name

                const isAttending = !!confirmedPersons[p.id]
                const pEffectiveIdx = effectivePersons.findIndex(
                  (ep) => ep.id === p.id,
                )
                const isCurrentlyInChair =
                  isMeInChair && p.id === chairPerson?.id
                const isAlreadyFinished =
                  isMeInChair &&
                  pEffectiveIdx >= 0 &&
                  pEffectiveIdx < activeChairIdx

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border space-y-2 text-xs shadow-2xs transition-all duration-300 ${
                      isAttending
                        ? "bg-[var(--secondary)]/25 border-[var(--border)]/60 opacity-100"
                        : "bg-[var(--secondary)]/10 border-[var(--border)]/40 opacity-35 grayscale-[50%]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                        <span className="text-[var(--primary)] font-extrabold">
                          #{personIdx + 1}
                        </span>
                        <span>{displayName}</span>
                        {p.isMe && (
                          <Badge
                            size="sm"
                            className="bg-[#2F6FA8] text-white py-0 px-1.5 text-[9px] font-bold"
                          >
                            {T.you}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {status === "completed" && confirmedPersons[p.id] ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                            <IconCheck size={11} stroke={3} />
                            <span>
                              {lang === "ar" ? "اكتملت الحلاقة" : "Completed"}
                            </span>
                          </span>
                        ) : isCurrentlyInChair ? (
                          <span className="text-[#2F6FA8] font-bold text-[10px] flex items-center gap-0.5 bg-[#2F6FA8]/10 px-1.5 py-0.5 rounded-md border border-[#2F6FA8]/30 animate-pulse">
                            <IconScissors size={11} stroke={2.2} />
                            <span>
                              {lang === "ar" ? "على الكرسي الآن" : "In Chair"}
                            </span>
                          </span>
                        ) : isAlreadyFinished ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                            <IconCheck size={11} stroke={3} />
                            <span>
                              {lang === "ar" ? "اكتملت الحلاقة" : "Finished"}
                            </span>
                          </span>
                        ) : confirmedPersons[p.id] ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                            <IconCheck size={11} stroke={3} />
                            <span>{T.attending}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--muted-foreground)] text-[10px] bg-[var(--secondary)]/80 px-1.5 py-0.5 rounded-md">
                            {T.notAttending}
                          </span>
                        )}
                        <span className="font-bold text-[var(--primary)] text-xs">
                          {pCost} {lang === "ar" ? "د.ل" : "LYD"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 text-[var(--muted-foreground)] border-t border-[var(--border)]/60 pt-2">
                      <div className="flex items-center justify-between">
                        <span>{lang === "ar" ? "الخدمة:" : "Service:"}</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {lang === "ar"
                            ? pSrv?.name || p.serviceName || "حلاقة"
                            : pSrv?.nameEn ||
                              p.serviceName ||
                              pSrv?.name ||
                              "Haircut"}{" "}
                          <span className="text-[var(--foreground)] font-bold">
                            ({servicePrice} {lang === "ar" ? "د.ل" : "LYD"})
                          </span>
                        </span>
                      </div>

                      {resolvedAddons.length > 0 && (
                        <div className="flex items-start justify-between gap-2 pt-0.5">
                          <span className="shrink-0">
                            {lang === "ar" ? "الإضافات:" : "Add-ons:"}
                          </span>
                          <div className="flex flex-col items-end gap-1">
                            {resolvedAddons.map((a) => (
                              <span
                                key={a.id}
                                className="font-medium text-[var(--foreground)]"
                              >
                                {a.name}{" "}
                                <span className="text-[var(--foreground)] font-semibold">
                                  ({a.price} {lang === "ar" ? "د.ل" : "LYD"})
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
            </div>
          </div>
        </Card>

        {status !== "completed" && (
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={advance}
            className="text-xs text-[var(--muted-foreground)] opacity-50 hover:opacity-100"
          >
            {T.demoStep}
          </Button>
        )}
      </div>

      {/* Attendance BottomSheet for confirming multiple attendees */}
      <BottomSheet
        isOpen={showAttendanceSheet}
        onClose={() => setShowAttendanceSheet(false)}
        title={T.confirmAttendanceFor}
        dir={dir}
      >
        <div className="space-y-4 pt-1" dir={dir}>
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]/60">
            <p className="text-xs text-[var(--muted-foreground)]">
              {lang === "ar"
                ? "أكد حضور كل شخص بشكل منفرد لتثبيت دوره في الطابور"
                : "Confirm attendance for each attendee individually"}
            </p>
            <Badge variant="secondary" className="text-[11px] font-semibold">
              {confirmedCount} / {currentPersons.length}
            </Badge>
          </div>

          {/* Persons list with individual check toggles */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto px-0.5">
            {currentPersons.map((p) => {
              const isPersonConfirmed = !!confirmedPersons[p.id]

              return (
                <div
                  key={p.id}
                  role="button"
                  onClick={() => togglePersonConfirm(p.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isPersonConfirmed
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isPersonConfirmed
                          ? "bg-emerald-500 text-white"
                          : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {isPersonConfirmed ? (
                        <IconCheck size={18} stroke={3} />
                      ) : (
                        <IconUser size={18} />
                      )}
                    </div>
                    <div className="min-w-0 text-start">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[var(--foreground)] truncate">
                          {p.isMe
                            ? p.name === "أنت" || p.name === "You"
                              ? currentUserName
                              : p.name
                            : p.name}
                        </span>
                        {p.isMe && (
                          <Badge
                            size="sm"
                            className="bg-[#2F6FA8] text-white text-[9px] py-0 px-1.5 font-bold"
                          >
                            {T.you}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                        {p.serviceName || booking.service}
                      </p>
                    </div>
                  </div>

                  {/* Status badge / toggle button */}
                  <div className="shrink-0">
                    {isPersonConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <IconCheck size={12} stroke={3} />
                        <span>{T.attending}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-[var(--muted-foreground)] bg-[var(--secondary)] border border-[var(--border)] px-3 py-1 rounded-full hover:text-[var(--foreground)]">
                        <span>{T.notAttending}</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Confirm attendance button in sheet */}
          <div className="pt-2 border-t border-[var(--border)]/60">
            <Button
              size="lg"
              fullWidth
              disabled={confirmedCount === 0}
              onClick={() => {
                setShowAttendanceSheet(false)
                setShowShopQrScanner(true)
              }}
              className="rounded-2xl font-bold h-12 shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2">
                <IconScan size={18} stroke={2.2} />
                <span>
                  {lang === "ar"
                    ? `تأكيد الحضور ومسح QR المحل (${confirmedCount})`
                    : `Confirm & Scan Shop QR (${confirmedCount})`}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Shop QR Scanner BottomSheet for validating presence inside the shop */}
      <QrScannerBottomSheet
        open={showShopQrScanner}
        onClose={() => setShowShopQrScanner(false)}
        shopName={booking.shopName}
        title={
          lang === "ar"
            ? "مسح QR المحل لتأكيد الحضور"
            : "Scan Shop QR to Confirm"
        }
        description={
          lang === "ar"
            ? `وجّه الكاميرا نحو رمز QR المعروض داخل المحل للتحقق من وصولك وتثبيت دورك`
            : `Align camera with the QR code inside ${booking.shopName} to verify arrival`
        }
        lang={lang}
        dir={dir}
        onScanSuccess={handleQrScanSuccess}
      />

      {/* Rating & Review BottomSheet upon haircut completion */}
      <ReviewBottomSheet
        open={showReview}
        onClose={() => setShowReview(false)}
        lang={lang}
        shopName={booking.shopName}
        defaultService={booking.service}
      />
    </div>
  )
}
