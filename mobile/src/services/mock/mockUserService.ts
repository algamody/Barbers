import type { IUserService } from "../api.interface"
import type { IStorageAdapter } from "../../storage/storage.interface"
import type { TRewardItem, TUserProfile } from "../../typings"
import { MOCK_REWARDS, MOCK_USER } from "./mockData"

const STORAGE_PROFILE_KEY = "barbers_user_profile"

export class MockUserService implements IUserService {
  constructor(private storage: IStorageAdapter) {}

  async getProfile(): Promise<TUserProfile> {
    const stored = await this.storage.getItem<TUserProfile>(STORAGE_PROFILE_KEY)
    if (stored) return stored

    await this.storage.setItem(STORAGE_PROFILE_KEY, MOCK_USER)
    return MOCK_USER
  }

  async updateProfile(data: Partial<TUserProfile>): Promise<TUserProfile> {
    const current = await this.getProfile()
    const updated: TUserProfile = {
      ...current,
      ...data,
    }
    await this.storage.setItem(STORAGE_PROFILE_KEY, updated)
    return updated
  }

  async getRewards(): Promise<TRewardItem[]> {
    return [...MOCK_REWARDS]
  }

  async claimReward(
    rewardId: string
  ): Promise<{ success: boolean; discount?: number; error?: string }> {
    const profile = await this.getProfile()
    const reward = MOCK_REWARDS.find((r) => r.id === rewardId)

    if (!reward) {
      return { success: false, error: "المكافأة غير متوفرة" }
    }

    if (profile.points < reward.pointsRequired) {
      return {
        success: false,
        error: `نقاطك الحالية (${profile.points}) غير كافية لاستبدال هذه المكافأة (${reward.pointsRequired} نقطة)`,
      }
    }

    // Deduct points
    const updatedProfile: TUserProfile = {
      ...profile,
      points: profile.points - reward.pointsRequired,
    }
    await this.storage.setItem(STORAGE_PROFILE_KEY, updatedProfile)

    return { success: true, discount: reward.discountValue || 0 }
  }
}
