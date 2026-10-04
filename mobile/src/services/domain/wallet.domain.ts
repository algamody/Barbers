import type { TTransaction, TWalletState } from "../../typings"
import { NO_SHOW_CASH_BAN_THRESHOLD } from "../../constants"

/**
 * Pure Domain logic for Wallet Balances, P2P Transfers,
 * No-Show Cash Bans, and Payment Restrictions.
 */
export class WalletDomainService {
  /**
   * Deducts funds and records a debit transaction.
   */
  static deductFunds(
    state: TWalletState,
    amount: number,
    description: string,
    provider: TTransaction["provider"] = "service"
  ): { nextState: TWalletState; transaction: TTransaction } {
    if (state.balance < amount) {
      throw new Error(`Insufficient wallet balance: current ${state.balance}, requested ${amount}`)
    }

    const nextBalance = Math.round((state.balance - amount) * 100) / 100
    const now = new Date()

    const transaction: TTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "debit",
      amount,
      description,
      date: "اليوم",
      time: now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" }),
      provider,
    }

    const nextState: TWalletState = {
      ...state,
      balance: nextBalance,
      transactions: [transaction, ...state.transactions],
    }

    return { nextState, transaction }
  }

  /**
   * Credits funds and records a credit transaction.
   */
  static creditFunds(
    state: TWalletState,
    amount: number,
    description: string,
    provider: TTransaction["provider"] = "onepay"
  ): { nextState: TWalletState; transaction: TTransaction } {
    const nextBalance = Math.round((state.balance + amount) * 100) / 100
    const now = new Date()

    const transaction: TTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "credit",
      amount,
      description,
      date: "اليوم",
      time: now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" }),
      provider,
    }

    const nextState: TWalletState = {
      ...state,
      balance: nextBalance,
      transactions: [transaction, ...state.transactions],
    }

    return { nextState, transaction }
  }

  /**
   * P2P Transfer validation.
   */
  static validateP2PTransfer(
    senderState: TWalletState,
    recipientWalletId: string,
    amount: number
  ): { isValid: boolean; errorMessageAr?: string } {
    if (amount <= 0) {
      return { isValid: false, errorMessageAr: "المبلغ المحوّل يجب أن يكون أكبر من صفر." }
    }

    if (senderState.balance < amount) {
      return { isValid: false, errorMessageAr: "رصيدك الحالي غير كافٍ لإتمام عملية التحويل." }
    }

    if (recipientWalletId.trim() === senderState.walletId.trim()) {
      return { isValid: false, errorMessageAr: "لا يمكنك تحويل رصيد إلى نفس معرف محفظتك." }
    }

    return { isValid: true }
  }

  /**
   * Rule: No-show on a cash booking disables cash payments from the 1st violation (NO_SHOW_CASH_BAN_THRESHOLD = 1).
   */
  static applyNoShowPenalty(
    state: TWalletState,
    paymentMethod: "wallet" | "cash"
  ): { nextState: TWalletState; isNowBanned: boolean } {
    const nextCount = state.noShowCount + 1
    const shouldBanCash =
      paymentMethod === "cash" && nextCount >= NO_SHOW_CASH_BAN_THRESHOLD

    const nextState: TWalletState = {
      ...state,
      noShowCount: nextCount,
      isCashBanned: shouldBanCash ? true : state.isCashBanned,
    }

    return {
      nextState,
      isNowBanned: shouldBanCash,
    }
  }
}
