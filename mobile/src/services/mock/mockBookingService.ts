import type { IBookingService } from "../api.interface"
import type { IStorageAdapter } from "../../storage/storage.interface"
import type { TDraftBooking, TGroupBooking, TGroupBookingPerson } from "../../typings"
import { BookingDomainService } from "../domain/booking.domain"
import { QueueDomainService } from "../domain/queue.domain"
import { MOCK_ACTIVE_BOOKING, MOCK_SHOPS } from "./mockData"

const STORAGE_ACTIVE_BOOKING_KEY = "barbers_active_booking"
const STORAGE_DRAFT_BOOKING_KEY = "barbers_draft_booking"

export class MockBookingService implements IBookingService {
  constructor(private storage: IStorageAdapter) {}

  async getActiveBooking(): Promise<TGroupBooking | null> {
    const raw = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (raw) return raw

    // Seed initial active booking for interactive demonstration
    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, MOCK_ACTIVE_BOOKING)
    return MOCK_ACTIVE_BOOKING
  }

  async createBooking(
    draft: TDraftBooking
  ): Promise<{ bookingId: string; success: boolean; error?: string }> {
    const shop = MOCK_SHOPS.find((s) => s.id === draft.shopId)
    if (!shop) {
      return { bookingId: "", success: false, error: "المحل غير موجود" }
    }

    const bookingId = `bk-${Date.now().toString().slice(-5)}`

    // Convert draft persons into group booking persons
    const persons: TGroupBookingPerson[] = draft.persons.map((p, idx) => {
      const service = shop.services.find((s) => s.id === p.serviceId) || shop.services[0]
      const chosenAddons = shop.addons.filter((a) => p.addonIds.includes(a.id))
      const price = BookingDomainService.calculatePersonPrice(service, chosenAddons)
      const staff = shop.staff.find((st) => st.id === (p.staffId || draft.selectedStaff))

      return {
        id: p.id || `p-${idx}`,
        name: p.name || (p.isMe ? "أنا" : `مرافق ${idx + 1}`),
        isMe: p.isMe,
        serviceId: service.id,
        serviceName: service.name,
        addonIds: chosenAddons.map((a) => a.id),
        addonNames: chosenAddons.map((a) => a.name),
        staffId: staff ? staff.id : null,
        staffName: staff ? staff.name : "أي حلاق متاح",
        price,
        confirmed: p.isMe,
        status: "accepted",
      }
    })

    const totalPrice = BookingDomainService.calculateGroupTotal(persons)
    const primaryStaff = shop.staff.find((st) => st.id === draft.selectedStaff)

    const newBooking: TGroupBooking = {
      bookingId,
      shopId: shop.id,
      shopName: shop.nameAr,
      staffName: primaryStaff ? primaryStaff.name : "أي حلاق متاح",
      service: persons[0]?.serviceName || "حلاقة",
      addons: persons[0]?.addonNames.join(", ") || "",
      position: shop.waitingCount + 1,
      totalAhead: shop.waitingCount,
      estimatedWait: (shop.waitingCount + 1) * 15,
      status: "in_queue",
      paymentMethod: draft.payment || "wallet",
      totalPrice,
      depositPaid: 0,
      isClaimedSlot: false,
      attendanceDeadline: QueueDomainService.generateAttendanceDeadline(),
      persons,
      createdAt: Date.now(),
    }

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, newBooking)
    await this.clearDraftBooking()

    return { bookingId, success: true }
  }

  async cancelBooking(
    bookingId: string,
    _reason?: string
  ): Promise<{ success: boolean; refunded: boolean; reasonMessageAr: string }> {
    const booking = await this.getActiveBooking()
    if (!booking || booking.bookingId !== bookingId) {
      return {
        success: false,
        refunded: false,
        reasonMessageAr: "الحجز غير موجود أو ملغى مسبقاً",
      }
    }

    // Enforce Domain Rule: Lock self cancellation when close to turn
    const cancelEval = QueueDomainService.evaluateCustomerCancellation(
      booking.position,
      booking.status
    )

    if (!cancelEval.canCancelSelf) {
      return {
        success: false,
        refunded: false,
        reasonMessageAr: cancelEval.reasonMessageAr,
      }
    }

    // Cancel booking and remove from active
    await this.storage.removeItem(STORAGE_ACTIVE_BOOKING_KEY)

    return {
      success: true,
      refunded: booking.paymentMethod === "wallet",
      reasonMessageAr: cancelEval.reasonMessageAr,
    }
  }

  async getDraftBooking(): Promise<TDraftBooking | null> {
    return this.storage.getItem<TDraftBooking>(STORAGE_DRAFT_BOOKING_KEY)
  }

  async saveDraftBooking(draft: TDraftBooking): Promise<void> {
    await this.storage.setItem(STORAGE_DRAFT_BOOKING_KEY, draft)
  }

  async clearDraftBooking(): Promise<void> {
    await this.storage.removeItem(STORAGE_DRAFT_BOOKING_KEY)
  }

  async submitReview(
    bookingId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; earnedPoints?: number; error?: string }> {
    const booking = await this.storage.getItem<TGroupBooking>(STORAGE_ACTIVE_BOOKING_KEY)
    if (!booking || booking.bookingId !== bookingId) {
      return { success: false, error: "الحجز غير موجود" }
    }

    const updatedBooking: TGroupBooking = {
      ...booking,
      status: "completed",
      rating,
      reviewComment: comment,
    }

    await this.storage.setItem(STORAGE_ACTIVE_BOOKING_KEY, updatedBooking)

    // Award 50 points to user
    const earnedPoints = 50
    try {
      const profile = await this.storage.getItem<any>("barbers_user_profile")
      if (profile) {
        await this.storage.setItem("barbers_user_profile", {
          ...profile,
          points: (profile.points || 0) + earnedPoints,
        })
      }
    } catch {}

    return { success: true, earnedPoints }
  }
}
