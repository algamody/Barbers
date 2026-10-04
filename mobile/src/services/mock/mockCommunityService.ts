import type { ICommunityService } from "../api.interface"
import type { IStorageAdapter } from "../../storage/storage.interface"
import type {
  TCommunityReport,
  TCommunityUpdateData,
  TCommunityVote,
} from "../../typings"
import { CommunityDomainService } from "../domain/community.domain"

const COMMUNITY_STORAGE_PREFIX = "barbers_community_"

export class MockCommunityService implements ICommunityService {
  private listeners: Map<
    string,
    Set<(data: TCommunityUpdateData) => void>
  > = new Map()

  constructor(private storage: IStorageAdapter) {}

  private getStorageKey(shopId: string): string {
    return `${COMMUNITY_STORAGE_PREFIX}${shopId}`
  }

  async getCommunityUpdate(shopId: string): Promise<TCommunityUpdateData> {
    const key = this.getStorageKey(shopId)
    const stored = await this.storage.getItem<TCommunityUpdateData>(key)

    if (stored) {
      // Purge any expired reports and recompute
      const activeReports = CommunityDomainService.purgeExpiredReports(stored.reports)
      const consensus = CommunityDomainService.computeConsensus(activeReports)
      const freshData: TCommunityUpdateData = {
        ...stored,
        reports: activeReports,
        ...consensus,
      }
      return freshData
    }

    // Default initial community data
    const initialData: TCommunityUpdateData = {
      shopId,
      updatedAt: new Date().toISOString(),
      isOpen: true,
      waitingCount: 3,
      openCount: 2,
      closedCount: 0,
      consensusStatus: "community_verified",
      reports: [
        {
          id: `rep-${shopId}-1`,
          userName: "عمر الجهاني",
          isOpen: true,
          waitingCount: 3,
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          note: "المحل مفتوح والحلاق طارق موجود، الانتظار خفيف 3 زبائن",
          confirmedCount: 3,
          unconfirmedCount: 0,
        },
      ],
    }

    await this.storage.setItem(key, initialData)
    return initialData
  }

  subscribeCommunity(
    shopId: string,
    listener: (data: TCommunityUpdateData) => void
  ): () => void {
    if (!this.listeners.has(shopId)) {
      this.listeners.set(shopId, new Set())
    }
    const set = this.listeners.get(shopId)!
    set.add(listener)

    this.getCommunityUpdate(shopId).then((data) => listener(data))

    return () => {
      set.delete(listener)
      if (set.size === 0) {
        this.listeners.delete(shopId)
      }
    }
  }

  private emitUpdate(shopId: string, data: TCommunityUpdateData) {
    const set = this.listeners.get(shopId)
    if (set) {
      set.forEach((listener) => listener(data))
    }
  }

  async submitReport(
    shopId: string,
    reportData: Omit<TCommunityReport, "id" | "confirmedCount" | "unconfirmedCount">
  ): Promise<{ success: boolean; report: TCommunityReport }> {
    const current = await this.getCommunityUpdate(shopId)

    const newReport: TCommunityReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      confirmedCount: 1, // Author confirms
      unconfirmedCount: 0,
    }

    const updatedData = CommunityDomainService.addReportAndUpdate(current, newReport)
    await this.storage.setItem(this.getStorageKey(shopId), updatedData)
    this.emitUpdate(shopId, updatedData)

    return { success: true, report: newReport }
  }

  async voteReport(
    shopId: string,
    vote: TCommunityVote
  ): Promise<{ success: boolean; updatedData: TCommunityUpdateData }> {
    const current = await this.getCommunityUpdate(shopId)

    const updatedReports = current.reports.map((report) => {
      if (report.id === vote.reportId) {
        return CommunityDomainService.applyVote(report, vote.vote)
      }
      return report
    })

    const consensus = CommunityDomainService.computeConsensus(updatedReports)
    const updatedData: TCommunityUpdateData = {
      ...current,
      updatedAt: new Date().toISOString(),
      reports: updatedReports,
      ...consensus,
    }

    await this.storage.setItem(this.getStorageKey(shopId), updatedData)
    this.emitUpdate(shopId, updatedData)

    return { success: true, updatedData }
  }
}
