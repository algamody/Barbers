import type {
  TShop,
  TGroupBooking,
  TDraftBooking,
  TWalletState,
  TP2PTransfer,
  TCommunityReport,
  TCommunityUpdateData,
  TCommunityVote,
  TUserProfile,
  TRewardItem,
} from "../typings"

/**
 * Core API Service Contracts
 * All screens, hooks, and UI components interact exclusively with these interfaces.
 * They never import from services/domain or services/mock directly.
 */

export interface IShopService {
  getShops(): Promise<TShop[]>
  getShopById(id: string): Promise<TShop | null>
  subscribeShopStatus(
    shopId: string,
    listener: (status: { isOpen: boolean; waitingCount: number }) => void
  ): () => void
}

export interface IBookingService {
  getActiveBooking(): Promise<TGroupBooking | null>
  createBooking(
    draft: TDraftBooking
  ): Promise<{ bookingId: string; success: boolean; error?: string }>
  cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; refunded: boolean; reasonMessageAr: string }>
  getDraftBooking(): Promise<TDraftBooking | null>
  saveDraftBooking(draft: TDraftBooking): Promise<void>
  clearDraftBooking(): Promise<void>
  submitReview(
    bookingId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; earnedPoints?: number; error?: string }>
}

export interface IQueueService {
  subscribeQueue(
    bookingId: string,
    listener: (data: TGroupBooking | null) => void
  ): () => void
  confirmAttendance(
    bookingId: string,
    companionIds: string[]
  ): Promise<{ success: boolean; error?: string }>
  claimAlternativeSlot(
    shopId: string,
    staffId: string
  ): Promise<{ success: boolean; error?: string }>
  removeMissingCompanion(
    bookingId: string,
    companionId: string
  ): Promise<{ success: boolean; refundAmount: number; error?: string }>
  respondToTransferOffer(
    bookingId: string,
    accept: boolean
  ): Promise<{ success: boolean; newStaffName?: string; error?: string }>
}

export interface IWalletService {
  getWalletState(): Promise<TWalletState>
  topUp(
    amount: number,
    provider: "onepay" | "lypay"
  ): Promise<{ success: boolean; newBalance: number }>
  transferP2P(transfer: TP2PTransfer): Promise<{ success: boolean; error?: string }>
  subscribeWallet(listener: (state: TWalletState) => void): () => void
}

export interface ICommunityService {
  getCommunityUpdate(shopId: string): Promise<TCommunityUpdateData>
  submitReport(
    shopId: string,
    report: Omit<TCommunityReport, "id" | "confirmedCount" | "unconfirmedCount">
  ): Promise<{ success: boolean; report: TCommunityReport }>
  voteReport(
    shopId: string,
    vote: TCommunityVote
  ): Promise<{ success: boolean; updatedData: TCommunityUpdateData }>
  subscribeCommunity(
    shopId: string,
    listener: (data: TCommunityUpdateData) => void
  ): () => void
}

export interface IUserService {
  getProfile(): Promise<TUserProfile>
  updateProfile(data: Partial<TUserProfile>): Promise<TUserProfile>
  getRewards(): Promise<TRewardItem[]>
  claimReward(
    rewardId: string
  ): Promise<{ success: boolean; discount?: number; error?: string }>
}

export interface IApiServices {
  shop: IShopService
  booking: IBookingService
  queue: IQueueService
  wallet: IWalletService
  community: ICommunityService
  user: IUserService
}
