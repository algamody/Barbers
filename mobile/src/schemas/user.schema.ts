import { z } from "zod"

export const UserProfileSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email().or(z.literal("")),
  avatar: z.string().nullable().default(null),
  walletId: z.string(),
  points: z.number().int().nonnegative().default(175),
  favorites: z.array(z.string()).default([]),
})

export const RewardItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleEn: z.string(),
  pointsRequired: z.number().int().positive(),
  description: z.string(),
  descriptionEn: z.string(),
  badge: z.string(),
  badgeEn: z.string(),
  type: z.enum(["fixed_discount", "percent_discount", "free_service"]),
  discountValue: z.number().positive().optional(),
})
