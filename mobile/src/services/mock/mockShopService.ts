import type { IShopService } from "../api.interface"
import type { TShop } from "../../typings"
import { MOCK_SHOPS } from "./mockData"

export class MockShopService implements IShopService {
  private shops: TShop[] = [...MOCK_SHOPS]
  private listeners: Map<
    string,
    Set<(status: { isOpen: boolean; waitingCount: number }) => void>
  > = new Map()

  async getShops(): Promise<TShop[]> {
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 80))
    return [...this.shops]
  }

  async getShopById(id: string): Promise<TShop | null> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const shop = this.shops.find((s) => s.id === id)
    return shop ? { ...shop } : null
  }

  subscribeShopStatus(
    shopId: string,
    listener: (status: { isOpen: boolean; waitingCount: number }) => void
  ): () => void {
    if (!this.listeners.has(shopId)) {
      this.listeners.set(shopId, new Set())
    }
    const set = this.listeners.get(shopId)!
    set.add(listener)

    // Return cleanup unsubscribe function
    return () => {
      set.delete(listener)
      if (set.size === 0) {
        this.listeners.delete(shopId)
      }
    }
  }

  /**
   * Helper for tests/demo: Emit simulated queue and status change to listeners
   */
  simulateStatusChange(
    shopId: string,
    updates: { isOpen: boolean; waitingCount: number }
  ) {
    const shop = this.shops.find((s) => s.id === shopId)
    if (shop) {
      shop.isOpen = updates.isOpen
      shop.waitingCount = updates.waitingCount
    }

    const listeners = this.listeners.get(shopId)
    if (listeners) {
      listeners.forEach((listener) => listener(updates))
    }
  }
}
