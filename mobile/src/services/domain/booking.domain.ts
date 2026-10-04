import type {
  TGroupBookingPerson,
  TPersonBooking,
  TService,
  TAddon,
  TRewardItem,
} from "../../typings"
import { GROUP_REASSIGN_TIMEOUT_SECONDS } from "../../constants"

/**
 * Pure Domain logic for Distributed Group Bookings,
 * Pricing Calculations, Discounts, and Companion Splitting.
 */
export class BookingDomainService {
  /**
   * Calculates the exact price for a single companion.
   */
  static calculatePersonPrice(
    service: TService,
    chosenAddons: TAddon[]
  ): number {
    const addonsTotal = chosenAddons.reduce((sum, a) => sum + a.price, 0)
    return service.price + addonsTotal
  }

  /**
   * Calculates the total price of all companions in a group booking.
   */
  static calculateGroupTotal(persons: TGroupBookingPerson[]): number {
    return persons.reduce((sum, p) => sum + p.price, 0)
  }

  /**
   * Applies reward coupon discount to the total booking price.
   */
  static applyDiscount(
    totalPrice: number,
    reward: TRewardItem
  ): { finalPrice: number; discountAmount: number } {
    let discountAmount = 0

    if (reward.type === "fixed_discount" && reward.discountValue) {
      discountAmount = Math.min(totalPrice, reward.discountValue)
    } else if (reward.type === "percent_discount" && reward.discountValue) {
      discountAmount = (totalPrice * reward.discountValue) / 100
    } else if (reward.type === "free_service") {
      discountAmount = totalPrice // 100% free
    }

    const finalPrice = Math.max(0, Math.round((totalPrice - discountAmount) * 100) / 100)
    return { finalPrice, discountAmount }
  }

  /**
   * Groups companions by assigned barber.
   * If companions are assigned to different barbers, each barber receives an independent sub-order.
   */
  static splitByBarber(
    persons: TGroupBookingPerson[]
  ): Map<string, { staffId: string | null; staffName: string; companions: TGroupBookingPerson[]; subTotal: number }> {
    const map = new Map<string, { staffId: string | null; staffName: string; companions: TGroupBookingPerson[]; subTotal: number }>()

    for (const person of persons) {
      const key = person.staffId || "any"
      if (!map.has(key)) {
        map.set(key, {
          staffId: person.staffId,
          staffName: person.staffName,
          companions: [],
          subTotal: 0,
        })
      }
      const entry = map.get(key)!
      entry.companions.push(person)
      entry.subTotal += person.price
    }

    return map
  }

  /**
   * Rule: Rejection by one barber refunds ONLY their companions' share and does NOT cancel the rest.
   */
  static handleBarberRejection(
    allPersons: TGroupBookingPerson[],
    rejectedStaffId: string
  ): {
    remainingPersons: TGroupBookingPerson[]
    refundAmount: number
    rejectedCompanions: TGroupBookingPerson[]
    canReassign: boolean
    reassignTimeoutSeconds: number
  } {
    const rejectedCompanions = allPersons.filter((p) => p.staffId === rejectedStaffId)
    const remainingPersons = allPersons.filter((p) => p.staffId !== rejectedStaffId)
    const refundAmount = rejectedCompanions.reduce((sum, p) => sum + p.price, 0)

    return {
      remainingPersons,
      refundAmount,
      rejectedCompanions,
      canReassign: true,
      reassignTimeoutSeconds: GROUP_REASSIGN_TIMEOUT_SECONDS,
    }
  }
}
