import React, { createContext, useContext } from "react"
import type { IApiServices } from "../api.interface"

const ApiContext = createContext<IApiServices | null>(null)

interface ApiProviderProps {
  services: IApiServices
  children: React.ReactNode
}

export function ApiProvider({ services, children }: ApiProviderProps) {
  return <ApiContext.Provider value={services}>{children}</ApiContext.Provider>
}

/**
 * Access the core API services.
 * Screens and hooks use this hook instead of directly importing services.
 */
export function useApi(): IApiServices {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider")
  }
  return context
}
