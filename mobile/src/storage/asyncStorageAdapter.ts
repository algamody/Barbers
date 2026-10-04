import AsyncStorage from "@react-native-async-storage/async-storage"
import type { IStorageAdapter } from "./storage.interface"

export class AsyncStorageAdapter implements IStorageAdapter {
  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const val = await AsyncStorage.getItem(key)
      if (val === null) return null
      try {
        return JSON.parse(val) as T
      } catch {
        return val as unknown as T
      }
    } catch {
      return null
    }
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value)
      await AsyncStorage.setItem(key, stringValue)
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
