import type { IQueueService } from "../api.interface"
import type { IStorageAdapter } from "../../storage/storage.interface"
import type { TGroupBooking } from "../../typings"
import { QueueDomainService } from "../domain/queue.domain"
import { MOCK_SHOPS } from "./mockData"

const STORAGE_ACTIVE_BOOKING_KEY = "barbers_active_booking"

export class MockQueueService implements IQueueService {
  private queueListeners: Map<
    string,
    Set<(data: TGroupBooking | null) => void>
  > = new Map()

  constructor(private storage: IStorageAdapter) {}

  subscribeQueue(
    bookingId: string,
    listener: (data: TGroupBooking | null) => void
  ): () => void {
    if (!this.queueListeners.has(bookingId)) {
      this.queueListeners.set(bookingId, new Set())
    }
    const set = this.queueListeners.get(bookingId)!
    set.add(listener)

    // Immediately emit current data to caller
    this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY).then((current) => {
      if (current && current.bookingId === bookingId) {
        listener(current)
      }
    })

    return () => {
      set.delete(listener)
      if (set.size === 0) {
        this.queueListeners.delete(bookingId)
      }
    }
  }

  private emitQueueUpdate(booking: TGroupBooking | null) {
    if (!booking) return
    const listeners = this.queueListeners.get(booking.bookingId)
    if (listeners) {
      listeners.forEach((listener) => listener(booking))
    }
  }

  async confirmAttendance(
    bookingId: string,
    companionIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    const booking = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (!booking || booking.bookingId !== bookingId) {
      return { success: false, error: "الحجز غير موجود" }
    }

    // Mark confirmed companions
    const updatedPersons = booking.persons.map((p) => {
      if (p.isMe || companionIds.includes(p.id)) {
        return { ...p, confirmed: true }
      }
      return p
    })

    const updatedBooking: TGroupBooking = {
      ...booking,
      status: "in_progress",
      persons: updatedPersons,
      attendanceDeadline: null, // cleared upon attendance confirmation
    }

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, updatedBooking)
    this.emitQueueUpdate(updatedBooking)

    return { success: true }
  }

  async claimAlternativeSlot(
    shopId: string,
    staffId: string
  ): Promise<{ success: boolean; error?: string }> {
    const shop = MOCK_SHOPS.find((s) => s.id === shopId)
    if (!shop) return { success: false, error: "المحل غير موجود" }

    const staff = shop.staff.find((st) => st.id === staffId)
    if (!staff || !staff.altBooking) {
      return { success: false, error: "لا يوجد مقعد بديل متاح لهذا الحلاق حالياً" }
    }

    const phase = QueueDomainService.getAttendancePhase(
      staff.altBooking.openWindowDeadline
    )

    // Rule: Priority fee is 5 LYD, lost whether customer attends or not
    const claimEval = QueueDomainService.processAlternativeClaim(
      staffId,
      phase.isAlternativeBookingOpen,
      100 // Mock wallet balance has sufficient funds
    )

    if (!claimEval.canClaim) {
      return { success: false, error: claimEval.errorMessageAr }
    }

    // Create alternative immediate priority booking
    const newBooking: TGroupBooking = {
      bookingId: `bk-alt-${Date.now().toString().slice(-4)}`,
      shopId: shop.id,
      shopName: shop.nameAr,
      staffName: staff.name,
      service: "حلاقة ذات أسبقية (مقعد بديل)",
      addons: "",
      position: 1,
      totalAhead: 0,
      estimatedWait: 0,
      status: "next_up",
      paymentMethod: "wallet",
      totalPrice: 15,
      depositPaid: claimEval.fee, // 5 LYD priority fee
      isClaimedSlot: true,
      attendanceDeadline: QueueDomainService.generateAttendanceDeadline(),
      persons: [
        {
          id: "p-me",
          name: "أنا (بديل ذو أسبقية)",
          isMe: true,
          serviceId: "sv1",
          serviceName: "حلاقة شعر",
          addonIds: [],
          addonNames: [],
          staffId: staff.id,
          staffName: staff.name,
          price: 15,
          confirmed: false,
          status: "accepted",
        },
      ],
      createdAt: Date.now(),
    }

    // Close the slot on staff
    staff.altBooking = null

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, newBooking)
    this.emitQueueUpdate(newBooking)

    return { success: true }
  }

  async removeMissingCompanion(
    bookingId: string,
    companionId: string
  ): Promise<{ success: boolean; refundAmount: number; error?: string }> {
    const booking = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (!booking || booking.bookingId !== bookingId) {
      return { success: false, refundAmount: 0, error: "الحجز غير موجود" }
    }

    try {
      const { updatedBooking, refundAmount } =
        QueueDomainService.handleMissingCompanion(booking, companionId)

      await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, updatedBooking)
      this.emitQueueUpdate(updatedBooking)

      return { success: true, refundAmount }
    } catch (err) {
      return {
        success: false,
        refundAmount: 0,
        error: err instanceof Error ? err.message : "تعذر إزالة المرافق",
      }
    }
  }

  async respondToTransferOffer(
    bookingId: string,
    accept: boolean
  ): Promise<{ success: boolean; newStaffName?: string; error?: string }> {
    const booking = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (!booking || booking.bookingId !== bookingId) {
      return { success: false, error: "الحجز غير موجود" }
    }

    if (!booking.transferOffer) {
      return { success: false, error: "لا يوجد عرض نقل حالياً أو انتهى وقته" }
    }

    const offerExpiresMs = new Date(booking.transferOffer.expiresAt).getTime()
    if (Date.now() > offerExpiresMs) {
      const expiredBooking = { ...booking, transferOffer: null }
      await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, expiredBooking)
      this.emitQueueUpdate(expiredBooking)
      return { success: false, error: "انتهت مهلة العرض (120 ثانية)" }
    }

    if (!accept) {
      const declinedBooking = { ...booking, transferOffer: null }
      await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, declinedBooking)
      this.emitQueueUpdate(declinedBooking)
      return { success: true }
    }

    // Accept transfer: move to offered barber immediately
    const newStaffName = booking.transferOffer.offeredStaffName
    const updatedPersons = booking.persons.map((p) => ({
      ...p,
      staffName: newStaffName,
    }))

    const transferredBooking: TGroupBooking = {
      ...booking,
      staffName: newStaffName,
      position: 1,
      totalAhead: 0,
      estimatedWait: 2,
      status: "next_up",
      transferOffer: null,
      persons: updatedPersons,
    }

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, transferredBooking)
    this.emitQueueUpdate(transferredBooking)

    return { success: true, newStaffName }
  }

  /**
   * Helper to simulate a barber chair transfer offer (120s proposal)
   */
  async triggerTransferOffer(
    bookingId: string,
    offeredStaffName: string = "كريم الشريف"
  ): Promise<void> {
    const booking = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (!booking || booking.bookingId !== bookingId) return

    const updatedBooking: TGroupBooking = {
      ...booking,
      transferOffer: {
        offeredStaffId: "st-alt",
        offeredStaffName,
        expiresAt: new Date(Date.now() + 120 * 1000).toISOString(),
        reasonAr: `أنهى الحلاق ${offeredStaffName} جلسته مبكراً ويرحب باستقبالك فوراً دون انتظار.`,
      },
    }

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, updatedBooking)
    this.emitQueueUpdate(updatedBooking)
  }

  /**
   * Helper for interactive tests: advance the queue position
   */
  async advanceQueue(bookingId: string): Promise<void> {
    const booking = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (!booking || booking.bookingId !== bookingId) return

    const newPosition = Math.max(1, booking.position - 1)
    const newTotalAhead = Math.max(0, booking.totalAhead - 1)
    const newStatus = newPosition === 1 ? "next_up" : "in_queue"

    const updatedBooking: TGroupBooking = {
      ...booking,
      position: newPosition,
      totalAhead: newTotalAhead,
      estimatedWait: newTotalAhead * 12,
      status: newStatus,
    }

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, updatedBooking)
    this.emitQueueUpdate(updatedBooking)
  }
}
