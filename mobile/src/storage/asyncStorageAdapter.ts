import AsyncStorage from "@react-native-async-storage/async-storage"
import type { IStorageAdapter } from "./storage.interface"

export class AsyncStorageAdapter implements IStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value)
    } catch {}
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch {}
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch {}
  }
}

export const defaultStorage: IStorageAdapter = new AsyncStorageAdapter()
