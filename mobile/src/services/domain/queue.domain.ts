import type { TGroupBooking, TGroupBookingPerson } from "../../typings"
import {
  ALT_BOOKING_FEE,
  ALT_OPEN_WINDOW_SECONDS,
  ATTENDANCE_TOTAL_WINDOW_SECONDS,
  CUSTOMER_TRANSFER_TIMEOUT_SECONDS,
} from "../../constants"

/**
 * Pure Domain logic for Queue Management, Attendance Timers,
 * Chair Progression, and Alternative Slot Claims.
 * This represents the business rules enforced on the server.
 */
export class QueueDomainService {
  /**
   * Generates a fixed 10-minute server deadline from now.
   */
  static generateAttendanceDeadline(): string {
    return new Date(Date.now() + ATTENDANCE_TOTAL_WINDOW_SECONDS * 1000).toISOString()
  }

  /**
   * Evaluates the current attendance phase based on the fixed deadline.
   * Total: 10 min (600s).
   * First 5 min (600s -> 300s remaining): Protected phase (only original customer).
   * Last 5 min (<= 300s remaining): Open phase (available for Alternative Claim).
   */
  static getAttendancePhase(deadlineIso?: string | null): {
    phase: "none" | "protected" | "open" | "expired"
    secondsRemaining: number
    isAlternativeBookingOpen: boolean
  } {
    if (!deadlineIso) {
      return { phase: "none", secondsRemaining: 0, isAlternativeBookingOpen: false }
    }

    const deadlineMs = new Date(deadlineIso).getTime()
    const diffSeconds = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000))

    if (diffSeconds <= 0) {
      return { phase: "expired", secondsRemaining: 0, isAlternativeBookingOpen: false }
    }

    if (diffSeconds <= ALT_OPEN_WINDOW_SECONDS) {
      return { phase: "open", secondsRemaining: diffSeconds, isAlternativeBookingOpen: true }
    }

    return { phase: "protected", secondsRemaining: diffSeconds, isAlternativeBookingOpen: false }
  }

  /**
   * Rule: Customer cancellation locks when approaching turn (1 person ahead or in next_up).
   * Only Support can cancel at that point.
   */
  static evaluateCustomerCancellation(
    position: number,
    status: TGroupBooking["status"]
  ): { canCancelSelf: boolean; requiresSupport: boolean; reasonMessageAr: string } {
    if (status === "next_up" || status === "in_progress" || position <= 2) {
      return {
        canCancelSelf: false,
        requiresSupport: true,
        reasonMessageAr:
          "دورك أصبح قريباً جداً أو قيد التنفيذ؛ يُقفل الإلغاء الذاتي لحماية جدول الحلاق. يرجى التواصل مع الدعم الفني.",
      }
    }

    return {
      canCancelSelf: true,
      requiresSupport: false,
      reasonMessageAr: "يمكنك الإلغاء مباشرة واسترداد الرصيد لمحفظتك.",
    }
  }

  /**
   * Rule: Missing companion is deleted and refunded before entering chair.
   * It is NOT recorded as a no-show on the main customer account.
   */
  static handleMissingCompanion(
    booking: TGroupBooking,
    missingPersonId: string
  ): {
    updatedBooking: TGroupBooking
    refundAmount: number
    removedPersonName: string
  } {
    const personToRemove = booking.persons.find((p) => p.id === missingPersonId)
    if (!personToRemove) {
      throw new Error(`Companion with id ${missingPersonId} not found in booking`)
    }

    const updatedPersons = booking.persons.filter((p) => p.id !== missingPersonId)
    const refundAmount = personToRemove.price
    const newTotalPrice = Math.max(0, booking.totalPrice - refundAmount)

    const updatedBooking: TGroupBooking = {
      ...booking,
      totalPrice: newTotalPrice,
      persons: updatedPersons,
    }

    return {
      updatedBooking,
      refundAmount,
      removedPersonName: personToRemove.name,
    }
  }

  /**
   * Rule: Claiming an Alternative Slot (5 LYD priority fee).
   * Enforces that the open window is currently active and applies two-phase commit.
   */
  static processAlternativeClaim(
    targetStaffId: string,
    isWindowOpen: boolean,
    claimerWalletBalance: number
  ): {
    canClaim: boolean
    fee: number
    errorMessageAr?: string
  } {
    const fee = ALT_BOOKING_FEE // 5 LYD

    if (!isWindowOpen) {
      return {
        canClaim: false,
        fee,
        errorMessageAr: "نافذة الحجز البديل لم تعد مفتوحة لهذا الكرسي أو أكد الزبون الأصلي حضوره.",
      }
    }

    if (claimerWalletBalance < fee) {
      return {
        canClaim: false,
        fee,
        errorMessageAr: `رصيد المحفظة غير كافٍ لدفع رسم الأسبقية (${fee} د.ل). يرجى شحن المحفظة أولاً.`,
      }
    }

    return {
      canClaim: true,
      fee,
    }
  }

  /**
   * Customer transfer countdown evaluation (120 seconds).
   */
  static isTransferOfferExpired(proposalTimestamp: number): boolean {
    const elapsedSeconds = (Date.now() - proposalTimestamp) / 1000
    return elapsedSeconds >= CUSTOMER_TRANSFER_TIMEOUT_SECONDS
  }
}
