import type { IApiServices } from "../api.interface"
import type { IStorageAdapter } from "../../storage/storage.interface"
import { defaultStorage } from "../../storage/asyncStorageAdapter"
import { MockShopService } from "./mockShopService"
import { MockBookingService } from "./mockBookingService"
import { MockQueueService } from "./mockQueueService"
import { MockWalletService } from "./mockWalletService"
import { MockCommunityService } from "./mockCommunityService"
import { MockUserService } from "./mockUserService"

export function createMockServices(storage: IStorageAdapter = defaultStorage): IApiServices {
  return {
    shop: new MockShopService(),
    booking: new MockBookingService(storage),
    queue: new MockQueueService(storage),
    wallet: new MockWalletService(storage),
    community: new MockCommunityService(storage),
    user: new MockUserService(storage),
  }
}

export const mockServices: IApiServices = createMockServices()
