import { z } from "zod"

export const PersonBookingSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  isMe: z.boolean(),
  serviceId: z.string(),
  addonIds: z.array(z.string()).default([]),
  staffId: z.string().nullable().default(null),
})

export const GroupBookingPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  isMe: z.boolean(),
  serviceId: z.string(),
  serviceName: z.string(),
  addonIds: z.array(z.string()).default([]),
  addonNames: z.array(z.string()).default([]),
  staffId: z.string().nullable(),
  staffName: z.string(),
  price: z.number().nonnegative(),
  confirmed: z.boolean().default(false),
  attendanceDeadline: z.string().nullable().optional(),
  status: z.enum([
    "pending_barber_approval",
    "accepted",
    "rejected",
    "in_chair",
    "completed",
    "cancelled",
  ]).default("accepted"),
})

export const GroupBookingSchema = z.object({
  bookingId: z.string(),
  shopId: z.string(),
  shopName: z.string(),
  staffName: z.string(), // primary or combined staff display
  service: z.string(),
  addons: z.string().default(""),
  position: z.number().int().positive(),
  totalAhead: z.number().int().nonnegative(),
  estimatedWait: z.number().int().nonnegative(), // in minutes
  status: z.enum(["in_queue", "next_up", "in_progress", "completed", "cancelled"]).default("in_queue"),
  paymentMethod: z.enum(["wallet", "cash"]),
  totalPrice: z.number().nonnegative(),
  depositPaid: z.number().nonnegative().default(0), // priority fee (5 LYD if claimed slot)
  isClaimedSlot: z.boolean().default(false),
  attendanceDeadline: z.string().nullable().optional(), // ISO string for 10-min countdown
  transferOffer: z
    .object({
      offeredStaffId: z.string(),
      offeredStaffName: z.string(),
      expiresAt: z.string(), // ISO string for 120-sec countdown
      reasonAr: z.string(),
    })
    .nullable()
    .optional(),
  rating: z.number().optional(),
  reviewComment: z.string().optional(),
  persons: z.array(GroupBookingPersonSchema),
  createdAt: z.number().default(() => Date.now()),
})

export const DraftBookingSchema = z.object({
  shopId: z.string(),
  serviceId: z.string().optional(),
  addonIds: z.array(z.string()).default([]),
  persons: z.array(PersonBookingSchema).default([]),
  step: z.enum(["barber", "group_list", "confirm"]).default("barber"),
  selectedStaff: z.string().nullable().default(null),
  payment: z.enum(["wallet", "cash"]).nullable().default(null),
  updatedAt: z.number().default(() => Date.now()),
})
