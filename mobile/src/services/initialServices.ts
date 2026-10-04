import type { IApiServices } from "./api.interface"
import { mockServices } from "./mock/mockServices"

/**
 * Initial active services for the application.
 * During development and mock phase, this defaults to mockServices.
 * In production with Thunder backend, this can be swapped with ThunderServices.
 */
export const initialServices: IApiServices = mockServices
