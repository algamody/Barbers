import { z } from "zod"

export const TransactionSchema = z.object({
  id: z.string(),
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive(),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  provider: z.enum([
    "onepay",
    "lypay",
    "service",
    "cashback",
    "transfer",
    "alt_fee",
    "refund",
  ]),
})

export const WalletStateSchema = z.object({
  balance: z.number().nonnegative(),
  walletId: z.string(),
  isCashBanned: z.boolean().default(false),
  noShowCount: z.number().int().nonnegative().default(0),
  transactions: z.array(TransactionSchema).default([]),
})

export const P2PTransferSchema = z.object({
  recipientWalletId: z.string().min(3),
  amount: z.number().positive(),
  recipientName: z.string(),
  recipientAvatar: z.string().optional(),
  recipientPhoneMasked: z.string(),
})
