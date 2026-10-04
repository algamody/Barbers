import { z } from "zod"

export const CommunityReportSchema = z.object({
  id: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  isOpen: z.boolean(),
  waitingCount: z.number().int().nonnegative(),
  time: z.string(), // ISO string
  note: z.string().optional(),
  photo: z.string().optional(),
  confirmedCount: z.number().int().nonnegative().default(0),
  unconfirmedCount: z.number().int().nonnegative().default(0),
})

export const CommunityUpdateDataSchema = z.object({
  shopId: z.string(),
  updatedAt: z.string(),
  isOpen: z.boolean(),
  waitingCount: z.number().int().nonnegative(),
  openCount: z.number().int().nonnegative(),
  closedCount: z.number().int().nonnegative(),
  consensusStatus: z.enum(["official", "community_verified", "unverified"]).default("unverified"),
  reports: z.array(CommunityReportSchema).default([]),
})

export const CommunityVoteSchema = z.object({
  reportId: z.string(),
  vote: z.enum(["correct", "incorrect"]),
  timestamp: z.number().default(() => Date.now()),
})
