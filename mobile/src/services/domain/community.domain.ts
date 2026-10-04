import type {
  TCommunityReport,
  TCommunityUpdateData,
  TCommunityVote,
} from "../../typings"

/**
 * Pure Domain logic for Crowdsourced Community Updates,
 * Vote Consensuses, and Report Expirations.
 */
export class CommunityDomainService {
  /**
   * Consensus threshold: Minimum net confirmations required
   * for a community report to be considered verified.
   */
  static readonly CONSENSUS_VOTE_THRESHOLD = 2

  /**
   * Maximum age of a report before it is considered expired (24 hours).
   */
  static readonly REPORT_TTL_HOURS = 24

  /**
   * Evaluates if a given report has expired based on its timestamp.
   */
  static isReportExpired(reportTimeIso: string): boolean {
    const reportDate = new Date(reportTimeIso)
    const now = new Date()
    const diffHours = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60)
    return diffHours >= this.REPORT_TTL_HOURS
  }

  /**
   * Filters out expired reports from the list.
   */
  static purgeExpiredReports(reports: TCommunityReport[]): TCommunityReport[] {
    return reports.filter((report) => !this.isReportExpired(report.time))
  }

  /**
   * Computes the consensus status and aggregated waiting count from valid reports.
   * - If an official update is present and newer, returns 'official'.
   * - If net confirmations >= CONSENSUS_VOTE_THRESHOLD (2-3 votes), returns 'community_verified'.
   * - Otherwise, returns 'unverified'.
   */
  static computeConsensus(
    reports: TCommunityReport[],
    isOfficial: boolean = false
  ): {
    consensusStatus: "official" | "community_verified" | "unverified"
    isOpen: boolean
    waitingCount: number
    openCount: number
    closedCount: number
  } {
    if (isOfficial) {
      return {
        consensusStatus: "official",
        isOpen: true,
        waitingCount: 0,
        openCount: 0,
        closedCount: 0,
      }
    }

    const activeReports = this.purgeExpiredReports(reports)
    if (activeReports.length === 0) {
      return {
        consensusStatus: "unverified",
        isOpen: true,
        waitingCount: 0,
        openCount: 0,
        closedCount: 0,
      }
    }

    let openVotes = 0
    let closedVotes = 0
    let totalWaitCount = 0
    let waitCountSamples = 0
    let maxNetConfirmations = 0

    for (const report of activeReports) {
      const netConfirmations = report.confirmedCount - report.unconfirmedCount
      if (netConfirmations > maxNetConfirmations) {
        maxNetConfirmations = netConfirmations
      }

      if (report.isOpen) {
        openVotes += 1 + Math.max(0, netConfirmations)
      } else {
        closedVotes += 1 + Math.max(0, netConfirmations)
      }

      totalWaitCount += report.waitingCount
      waitCountSamples += 1
    }

    const avgWait = waitCountSamples > 0 ? Math.round(totalWaitCount / waitCountSamples) : 0
    const isOpen = openVotes >= closedVotes
    const isVerified = maxNetConfirmations >= this.CONSENSUS_VOTE_THRESHOLD

    return {
      consensusStatus: isVerified ? "community_verified" : "unverified",
      isOpen,
      waitingCount: avgWait,
      openCount: openVotes,
      closedCount: closedVotes,
    }
  }

  /**
   * Applies a user vote to a community report and returns updated report.
   */
  static applyVote(
    report: TCommunityReport,
    vote: TCommunityVote["vote"]
  ): TCommunityReport {
    if (vote === "correct") {
      return {
        ...report,
        confirmedCount: report.confirmedCount + 1,
      }
    } else {
      return {
        ...report,
        unconfirmedCount: report.unconfirmedCount + 1,
      }
    }
  }

  /**
   * Appends a new report and re-evaluates the aggregate community data.
   */
  static addReportAndUpdate(
    currentData: TCommunityUpdateData,
    newReport: TCommunityReport
  ): TCommunityUpdateData {
    const updatedReports = [newReport, ...currentData.reports]
    const activeReports = this.purgeExpiredReports(updatedReports)
    const consensus = this.computeConsensus(activeReports)

    return {
      ...currentData,
      updatedAt: new Date().toISOString(),
      isOpen: consensus.isOpen,
      waitingCount: consensus.waitingCount,
      openCount: consensus.openCount,
      closedCount: consensus.closedCount,
      consensusStatus: consensus.consensusStatus,
      reports: activeReports,
    }
  }
}
