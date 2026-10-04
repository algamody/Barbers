import type { IWalletService } from "../api.interface"
import type { IStorageAdapter } from "../../storage/storage.interface"
import type { TP2PTransfer, TWalletState } from "../../typings"
import { WalletDomainService } from "../domain/wallet.domain"
import { MOCK_WALLET } from "./mockData"

const STORAGE_WALLET_KEY = "barbers_wallet_state"

export class MockWalletService implements IWalletService {
  private listeners: Set<(state: TWalletState) => void> = new Set()

  constructor(private storage: IStorageAdapter) {}

  async getWalletState(): Promise<TWalletState> {
    const stored = await this.storage.getItem<TWalletState>(STORAGE_WALLET_KEY)
    if (stored) return stored

    await this.storage.setItem(STORAGE_WALLET_KEY, MOCK_WALLET)
    return MOCK_WALLET
  }

  subscribeWallet(listener: (state: TWalletState) => void): () => void {
    this.listeners.add(listener)

    // Emit current state immediately
    this.getWalletState().then((state) => listener(state))

    return () => {
      this.listeners.delete(listener)
    }
  }

  private emitStateChange(state: TWalletState) {
    this.listeners.forEach((listener) => listener(state))
  }

  async topUp(
    amount: number,
    provider: "onepay" | "lypay"
  ): Promise<{ success: boolean; newBalance: number }> {
    const currentState = await this.getWalletState()
    const providerNameAr = provider === "onepay" ? "ون باي (OnePay)" : "لي باي (LYPay)"

    const { nextState } = WalletDomainService.creditFunds(
      currentState,
      amount,
      `شحن رصيد إلكتروني عبر ${providerNameAr}`,
      provider
    )

    await this.storage.setItem(STORAGE_WALLET_KEY, nextState)
    this.emitStateChange(nextState)

    return { success: true, newBalance: nextState.balance }
  }

  async transferP2P(
    transfer: TP2PTransfer
  ): Promise<{ success: boolean; error?: string }> {
    const currentState = await this.getWalletState()

    const validation = WalletDomainService.validateP2PTransfer(
      currentState,
      transfer.recipientWalletId,
      transfer.amount
    )

    if (!validation.isValid) {
      return { success: false, error: validation.errorMessageAr }
    }

    const { nextState } = WalletDomainService.deductFunds(
      currentState,
      transfer.amount,
      `تحويل فوري إلى ${transfer.recipientName} (${transfer.recipientWalletId})`,
      "transfer"
    )

    await this.storage.setItem(STORAGE_WALLET_KEY, nextState)
    this.emitStateChange(nextState)

    return { success: true }
  }
}
