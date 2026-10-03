/**
 * Core API Service Contracts
 * All screens, hooks, and UI components interact exclusively with these interfaces.
 * They never import from services/domain or services/mock directly.
 */

export interface ShopSummary {
  id: string
  name: string
  nameAr: string
  address: string
  distance: string
  isOpen: boolean
  isVerified: boolean
  waitingCount: number
  rating: number
  reviewCount: number
}

export interface IShopService {
  getShops(): Promise<ShopSummary[]>
  getShopById(id: string): Promise<ShopSummary | null>
  subscribeShopStatus(shopId: string, listener: (status: { isOpen: boolean; waitingCount: number }) => void): () => void
}

export interface IBookingService {
  getActiveBooking(): Promise<unknown | null>
  createBooking(bookingData: unknown): Promise<{ bookingId: string; success: boolean }>
  cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; refunded: boolean }>
}

export interface IQueueService {
  subscribeQueue(bookingId: string, listener: (data: unknown) => void): () => void
  confirmAttendance(bookingId: string, companionIds: string[]): Promise<boolean>
  claimAlternativeSlot(shopId: string, staffId: string): Promise<{ success: boolean; error?: string }>
}

export interface IWalletService {
  getBalance(): Promise<number>
  topUp(amount: number, provider: "onepay" | "lypay"): Promise<{ success: boolean; newBalance: number }>
  transferP2P(recipientId: string, amount: number): Promise<{ success: boolean; error?: string }>
}

export interface IApiServices {
  shop: IShopService
  booking: IBookingService
  queue: IQueueService
  wallet: IWalletService
}
