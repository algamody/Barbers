import type { IApiServices } from "./api.interface"

export const initialServices: IApiServices = {
  shop: {
    async getShops() {
      return []
    },
    async getShopById() {
      return null
    },
    subscribeShopStatus() {
      return () => {}
    },
  },
  booking: {
    async getActiveBooking() {
      return null
    },
    async createBooking() {
      return { bookingId: "mock-1", success: true }
    },
    async cancelBooking() {
      return { success: true, refunded: true }
    },
  },
  queue: {
    subscribeQueue() {
      return () => {}
    },
    async confirmAttendance() {
      return true
    },
    async claimAlternativeSlot() {
      return { success: true }
    },
  },
  wallet: {
    async getBalance() {
      return 48
    },
    async topUp(amount) {
      return { success: true, newBalance: 48 + amount }
    },
    async transferP2P() {
      return { success: true }
    },
  },
}
