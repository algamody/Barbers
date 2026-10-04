import type { z } from "zod"
import type {
  ServiceSchema,
  AddonSchema,
  StaffMemberSchema,
  ShopSchema,
  ReviewSchema,
  GalleryPhotoSchema,
} from "../schemas/shop.schema"
import type {
  PersonBookingSchema,
  GroupBookingPersonSchema,
  GroupBookingSchema,
  DraftBookingSchema,
} from "../schemas/booking.schema"
import type {
  TransactionSchema,
  WalletStateSchema,
  P2PTransferSchema,
} from "../schemas/wallet.schema"
import type {
  CommunityReportSchema,
  CommunityUpdateDataSchema,
  CommunityVoteSchema,
} from "../schemas/community.schema"
import type { UserProfileSchema, RewardItemSchema } from "../schemas/user.schema"

// Shop & Staff Types
export type TService = z.infer<typeof ServiceSchema>
export type TAddon = z.infer<typeof AddonSchema>
export type TStaffMember = z.infer<typeof StaffMemberSchema>
export type TShop = z.infer<typeof ShopSchema>
export type TReview = z.infer<typeof ReviewSchema>
export type TGalleryPhoto = z.infer<typeof GalleryPhotoSchema>

// Booking & Queue Types
export type TPersonBooking = z.infer<typeof PersonBookingSchema>
export type TGroupBookingPerson = z.infer<typeof GroupBookingPersonSchema>
export type TGroupBooking = z.infer<typeof GroupBookingSchema>
export type TDraftBooking = z.infer<typeof DraftBookingSchema>

// Wallet & Finance Types
export type TTransaction = z.infer<typeof TransactionSchema>
export type TWalletState = z.infer<typeof WalletStateSchema>
export type TP2PTransfer = z.infer<typeof P2PTransferSchema>

// Community Crowdsource Types
export type TCommunityReport = z.infer<typeof CommunityReportSchema>
export type TCommunityUpdateData = z.infer<typeof CommunityUpdateDataSchema>
export type TCommunityVote = z.infer<typeof CommunityVoteSchema>

// User & Rewards Types
export type TUserProfile = z.infer<typeof UserProfileSchema>
export type TRewardItem = z.infer<typeof RewardItemSchema>
